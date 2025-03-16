import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./styles/GraphDemo.css";

const GraphDemo = () => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Use refs instead of state for positions and transform to avoid re-renders
  const nodePositionsRef = useRef({});
  const currentTransformRef = useRef(null);
  const simulationRef = useRef(null); // Store the simulation reference
  
  // Sample data for the tree - now with parent references
  const initialData = {
    nodes: [
      { id: 1, name: "Root Concept", info: "This is the root concept", parentId: null },
      { id: 2, name: "Child Concept A", info: "This is a child of the root concept", parentId: 1 },
      { id: 3, name: "Child Concept B", info: "This is another child of the root concept", parentId: 1 },
    ],
    links: [
      { source: 1, target: 2 },
      { source: 1, target: 3 },
    ]
  };
  
  const [treeData, setTreeData] = useState(initialData);
  
  // Function to add a child node
  const addChildNode = (parentId) => {
    const newId = Math.max(...treeData.nodes.map(n => n.id)) + 1;
    const newNode = { 
      id: newId, 
      name: `Concept ${String.fromCharCode(64 + newId)}`, 
      info: `This is a child of Concept ${treeData.nodes.find(n => n.id === parentId)?.name || ''}`,
      parentId: parentId
    };
    
    // Get parent position to position the new child below it
    const parentPos = nodePositionsRef.current[parentId];
    if (parentPos) {
      // Position the new node below its parent
      nodePositionsRef.current[newId] = {
        x: parentPos.x,
        y: parentPos.y + 150 // Position below parent
      };
    }
    
    setTreeData(prevData => ({
      nodes: [...prevData.nodes, newNode],
      links: [...prevData.links, { source: parentId, target: newId }]
    }));
  };
  
  // Function to add a parent node (only for root nodes)
  const addParentNode = (childId) => {
    // Get the child node
    const childNode = treeData.nodes.find(n => n.id === childId);
    if (!childNode || childNode.parentId !== null) return; // Only allow adding parent to root nodes
    
    const newId = Math.max(...treeData.nodes.map(n => n.id)) + 1;
    const newNode = { 
      id: newId, 
      name: `Concept ${String.fromCharCode(64 + newId)}`, 
      info: `This is the parent of ${childNode.name}`,
      parentId: null // New node becomes the root
    };
    
    // Get child position to position the new parent above it
    const childPos = nodePositionsRef.current[childId];
    if (childPos) {
      // Position the new node above its child
      nodePositionsRef.current[newId] = {
        x: childPos.x,
        y: childPos.y - 150 // Position above child
      };
    }
    
    // Update the child node to reference the new parent
    const updatedNodes = treeData.nodes.map(node => 
      node.id === childId ? { ...node, parentId: newId } : node
    );
    
    setTreeData({
      nodes: [...updatedNodes, newNode],
      links: [...treeData.links, { source: newId, target: childId }]
    });
    
    return newId; // Return the new parent ID
  };
  
  // Function to add a sibling node (through the parent)
  const addSiblingNode = (nodeId) => {
    // Find the node
    const node = treeData.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Get the position of the current node
    const nodePos = nodePositionsRef.current[nodeId];
    
    // If it's a root node, first add a parent, then add a sibling
    if (node.parentId === null) {
      // First add a parent and get its ID
      const newParentId = addParentNode(nodeId);
      
      // Now add a sibling by adding a child to the new parent
      // Use a callback to ensure we're working with the latest state
      setTreeData(prevData => {
        const newId = Math.max(...prevData.nodes.map(n => n.id)) + 1;
        const newNode = { 
          id: newId, 
          name: `Concept ${String.fromCharCode(64 + newId)}`, 
          info: `This is a sibling of ${node.name}`,
          parentId: newParentId
        };
        
        // Position the new sibling to the right of the original node
        if (nodePos) {
          nodePositionsRef.current[newId] = {
            x: nodePos.x + 150, // Position to the right
            y: nodePos.y // Same vertical level
          };
        }
        
        return {
          nodes: [...prevData.nodes, newNode],
          links: [...prevData.links, { source: newParentId, target: newId }]
        };
      });
    } else {
      // Regular case - add a child to the parent (which is a sibling to the current node)
      const parentId = node.parentId;
      const newId = Math.max(...treeData.nodes.map(n => n.id)) + 1;
      const newNode = { 
        id: newId, 
        name: `Concept ${String.fromCharCode(64 + newId)}`, 
        info: `This is a sibling of ${node.name}`,
        parentId: parentId
      };
      
      // Position the new sibling to the right of the current node
      if (nodePos) {
        nodePositionsRef.current[newId] = {
          x: nodePos.x + 150, // Position to the right
          y: nodePos.y // Same vertical level
        };
      }
      
      setTreeData(prevData => ({
        nodes: [...prevData.nodes, newNode],
        links: [...prevData.links, { source: parentId, target: newId }]
      }));
    }
  };
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const width = 800;
    const height = 600;
    const nodeRadius = 30;
    
    // Flag to track if we're currently dragging
    let isDragging = false;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("class", "graph-svg");
    
    // Create a group for the graph
    const g = svg.append("g");
    
    // Create zoom behavior with improved settings
    const zoom = d3.zoom()
      .scaleExtent([0.2, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        // Store the current transform state in ref
        currentTransformRef.current = event.transform;
      });
    
    // Enable zoom and pan on the SVG
    svg.call(zoom)
      .on("dblclick.zoom", null); // Disable double-click zoom
    
    // Create root hierarchy
    const rootNode = treeData.nodes.find(n => n.parentId === null);
    if (!rootNode) return;
    
    // Create hierarchy from flat data for initial positioning
    const stratify = d3.stratify()
      .id(d => d.id)
      .parentId(d => d.parentId);
    
    const root = stratify(treeData.nodes);
    
    // Apply a basic tree layout for initial positions
    const treeLayout = d3.tree()
      .size([width - 200, height - 200])
      .nodeSize([120, 150]);
    
    treeLayout(root);
    
    // Prepare data for force simulation
    const nodes = root.descendants().map(d => ({
      id: d.data.id,
      name: d.data.name,
      info: d.data.info,
      parentId: d.data.parentId,
      // Use stored positions if available, otherwise use tree layout positions
      x: nodePositionsRef.current[d.data.id]?.x || d.x,
      y: nodePositionsRef.current[d.data.id]?.y || d.y,
      // Store depth for hierarchical forces
      depth: d.depth,
      // Store children count for layout adjustments
      childCount: d.children ? d.children.length : 0
    }));
    
    // Create links with source/target as objects
    const links = root.links().map(d => ({
      source: nodes.find(n => n.id === d.source.data.id),
      target: nodes.find(n => n.id === d.target.data.id)
    }));
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      // Link force to keep connected nodes together
      .force("link", d3.forceLink(links)
        .id(d => d.id)
        .distance(d => 120) // Adjust link distance
        .strength(0.7)) // Adjust link strength
      // Charge force for node repulsion
      .force("charge", d3.forceManyBody()
        .strength(-500)) // Adjust repulsion strength
      // Center force to keep the graph centered
      .force("center", d3.forceCenter(width / 2, height / 2))
      // X force to maintain hierarchical structure
      .force("x", d3.forceX().x(d => {
        // Position based on depth - root at center, children spread out
        return width / 2 + (d.depth - 1) * 200;
      }).strength(0.3))
      // Y force to maintain hierarchical levels
      .force("y", d3.forceY().y(d => {
        // Position based on depth - root at top, children below
        return 100 + d.depth * 150;
      }).strength(0.3))
      // Collision force to prevent overlap
      .force("collision", d3.forceCollide().radius(nodeRadius * 1.5))
      // Custom force to maintain parent-child relationships
      .force("hierarchy", alpha => {
        const k = alpha * 0.5;
        links.forEach(link => {
          // Parent should be above child
          if (link.source.depth < link.target.depth) {
            link.target.y += (link.source.y + 150 - link.target.y) * k;
          }
        });
      });
    
    // Store simulation reference
    simulationRef.current = simulation;
    
    // Apply stored positions to existing nodes
    nodes.forEach(node => {
      const storedPosition = nodePositionsRef.current[node.id];
      if (storedPosition) {
        node.x = storedPosition.x;
        node.y = storedPosition.y;
        // Fix position initially to maintain user positioning
        node.fx = storedPosition.x;
        node.fy = storedPosition.y;
      }
    });
    
    // Create links with curved paths
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("stroke-width", 2);
    
    // Create node groups
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node");
    
    // Create drag behavior
    const dragBehavior = d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
    
    // Apply drag behavior to nodes
    node.call(dragBehavior);
    
    // Add circles to nodes
    node.append("circle")
      .attr("r", nodeRadius)
      .attr("fill", d => d.parentId === null ? "#ff9966" : "#69b3a2") // Root node has different color
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("click", (event, d) => {
        // Prevent event propagation
        event.stopPropagation();
        
        // Ignore click if we're during or right after dragging
        if (isDragging || event.defaultPrevented) return;
        
        // Toggle selection state
        const newSelectedId = selectedNode === d.id ? null : d.id;
        setSelectedNode(newSelectedId);
        
        // Update breathing animation
        d3.selectAll("circle").classed("breathing", false); // Remove from all nodes
        
        // Add breathing to the newly selected node
        if (newSelectedId !== null) {
          d3.select(event.currentTarget).classed("breathing", true);
        }
      });
    
    // Add text labels to nodes
    node.append("text")
      .text(d => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "#fff")
      .attr("font-size", "12px");
    
    // Add "+" buttons for expansion
    node.each(function(d) {
      const nodeGroup = d3.select(this);
      
      // Add top "+" button for adding parent (only for root nodes)
      if (d.parentId === null) {
        nodeGroup.append("circle")
          .attr("class", "add-button")
          .attr("cx", 0)
          .attr("cy", -nodeRadius * 2)
          .attr("r", 10)
          .attr("fill", "#fff")
          .attr("stroke", "#69b3a2")
          .attr("stroke-width", 2)
          .on("click", (event) => {
            event.stopPropagation();
            addParentNode(d.id);
          });
          
        nodeGroup.append("text")
          .attr("class", "add-button-text")
          .attr("x", 0)
          .attr("y", -nodeRadius * 2)
          .attr("text-anchor", "middle")
          .attr("dy", ".3em")
          .attr("fill", "#69b3a2")
          .attr("font-size", "16px")
          .attr("font-weight", "bold")
          .text("+")
          .on("click", (event) => {
            event.stopPropagation();
            addParentNode(d.id);
          });
      }
      
      // Add right "+" button for adding siblings (for all nodes)
      nodeGroup.append("circle")
        .attr("class", "add-button")
        .attr("cx", nodeRadius * 2)
        .attr("cy", 0)
        .attr("r", 10)
        .attr("fill", "#fff")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 2)
        .on("click", (event) => {
          event.stopPropagation();
          addSiblingNode(d.id);
        });
        
      nodeGroup.append("text")
        .attr("class", "add-button-text")
        .attr("x", nodeRadius * 2)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .attr("fill", "#69b3a2")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("+")
        .on("click", (event) => {
          event.stopPropagation();
          addSiblingNode(d.id);
        });
      
      // Add bottom "+" button for adding children
      nodeGroup.append("circle")
        .attr("class", "add-button")
        .attr("cx", 0)
        .attr("cy", nodeRadius * 2)
        .attr("r", 10)
        .attr("fill", "#fff")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 2)
        .on("click", (event) => {
          event.stopPropagation();
          addChildNode(d.id);
        });
        
      nodeGroup.append("text")
        .attr("class", "add-button-text")
        .attr("x", 0)
        .attr("y", nodeRadius * 2)
        .attr("text-anchor", "middle")
        .attr("dy", ".3em")
        .attr("fill", "#69b3a2")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .text("+")
        .on("click", (event) => {
          event.stopPropagation();
          addChildNode(d.id);
        });
    });
    
    // Add info callouts for selected node
    svg.on("click", (event) => {
      // Only reset selection if clicking directly on the SVG background
      // and not during or right after dragging
      if (event.target === svg.node() && !isDragging) {
        setSelectedNode(null);
        d3.selectAll("circle").classed("breathing", false);
      }
    });
    
    // Apply the stored transform if available, otherwise center the tree
    if (currentTransformRef.current) {
      svg.call(zoom.transform, currentTransformRef.current);
    } else {
      // Center the tree initially with better positioning
      // Calculate the bounding box of the tree
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      
      nodes.forEach(d => {
        minX = Math.min(minX, d.x);
        maxX = Math.max(maxX, d.x);
        minY = Math.min(minY, d.y);
        maxY = Math.max(maxY, d.y);
      });
      
      const treeWidth = maxX - minX;
      const treeHeight = maxY - minY;
      
      // Center the tree in the viewport
      const initialTransform = d3.zoomIdentity
        .translate(
          (width - treeWidth) / 2 - minX,
          (height - treeHeight) / 3 - minY
        )
        .scale(0.8);
      
      svg.call(zoom.transform, initialTransform);
      currentTransformRef.current = initialTransform;
    }
    
    // Update function for simulation
    simulation.on("tick", () => {
      // Update link paths
      link.attr("d", d => {
        return `M${d.source.x},${d.source.y}
                C${d.source.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${d.target.y}`;
      });
      
      // Update node positions
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });
    
    // Run simulation for a bit then stop
    simulation.alpha(1).restart();
    
    // Stop simulation after initial layout
    setTimeout(() => {
      simulation.stop();
      // Release fixed positions after initial layout
      nodes.forEach(node => {
        if (!nodePositionsRef.current[node.id]) {
          node.fx = null;
          node.fy = null;
        }
      });
    }, 2000);
    
    // When a new node is added, run the simulation briefly to adjust positions
    if (treeData.nodes.some(n => !nodePositionsRef.current[n.id])) {
      // New node detected, run simulation for a short time
      simulation.alpha(0.3).restart();
      setTimeout(() => simulation.stop(), 1000);
    }
    
    // Drag functions
    function dragstarted(event, d) {
      // Prevent event propagation
      event.sourceEvent.stopPropagation();
      
      // Set dragging flags
      isDragging = true;
      
      // Restart simulation during drag
      if (!event.active) simulation.alphaTarget(0.3).restart();
      
      // Fix position during drag
      d.fx = d.x;
      d.fy = d.y;
      
      // Add visual feedback
      d3.select(this).classed("dragging", true);
    }
    
    function dragged(event, d) {
      // Update fixed position
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      // Stop simulation heating
      if (!event.active) simulation.alphaTarget(0);
      
      // Store the position in our position store ref
      nodePositionsRef.current[d.id] = { x: d.x, y: d.y };
      
      // Keep position fixed after drag
      // This ensures the node stays where the user placed it
      
      // Remove visual feedback
      d3.select(this).classed("dragging", false);
      
      // Reset dragging flag after a short delay
      setTimeout(() => {
        isDragging = false;
      }, 100);
    }
    
    // Cleanup function
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
    
  }, [treeData, selectedNode]);
  
  return (
    <div className="graph-demo-container">
      <h2>Interactive Knowledge Tree Demo</h2>
      <div className="graph-container">
        <svg ref={svgRef}></svg>
        
        {selectedNode && (
          <div className="info-callout">
            <h3>{treeData.nodes.find(n => n.id === selectedNode)?.name}</h3>
            <p>{treeData.nodes.find(n => n.id === selectedNode)?.info}</p>
          </div>
        )}
      </div>
      <div className="graph-instructions">
        <h3>How to use:</h3>
        <ul>
          <li>Drag the canvas to move around the tree</li>
          <li>Zoom in/out using the mouse wheel</li>
          <li>Drag nodes to reposition them (they'll stay where you place them)</li>
          <li>Click on a node to select it and see more information</li>
          <li>Click the bottom "+" button to add a child node</li>
          <li>Click the right "+" button to add a sibling (for root nodes, this will first add a parent)</li>
          <li>Click the top "+" button on root nodes to add a parent</li>
        </ul>
      </div>
    </div>
  );
};

export default GraphDemo; 