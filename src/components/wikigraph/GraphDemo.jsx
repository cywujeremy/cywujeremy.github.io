import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./styles/GraphDemo.css";

const GraphDemo = () => {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  
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
        
        return {
          nodes: [...prevData.nodes, newNode],
          links: [...prevData.links, { source: newParentId, target: newId }]
        };
      });
    } else {
      // Regular case - add a child to the parent (which is a sibling to the current node)
      addChildNode(node.parentId);
    }
  };
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();
    
    const width = 800;
    const height = 600;
    const nodeRadius = 30;
    
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
      });
    
    // Enable zoom and pan on the SVG
    svg.call(zoom)
      .on("dblclick.zoom", null); // Disable double-click zoom
    
    // Create hierarchical layout
    const treeLayout = d3.tree()
      .size([width - 200, height - 200])
      .nodeSize([120, 150]);
    
    // Create root hierarchy
    const rootNode = treeData.nodes.find(n => n.parentId === null);
    if (!rootNode) return;
    
    // Create hierarchy from flat data
    const stratify = d3.stratify()
      .id(d => d.id)
      .parentId(d => d.parentId);
    
    const root = stratify(treeData.nodes);
    
    // Apply the tree layout
    treeLayout(root);
    
    // Create links with curved paths
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(root.links())
      .enter()
      .append("path")
      .attr("d", d => {
        return `M${d.source.x},${d.source.y}
                C${d.source.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${d.target.y}`;
      })
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("stroke-width", 2);
    
    // Create node groups
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    // Add circles to nodes
    node.append("circle")
      .attr("r", nodeRadius)
      .attr("fill", d => d.data.parentId === null ? "#ff9966" : "#69b3a2") // Root node has different color
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNode(selectedNode === d.data.id ? null : d.data.id);
        
        // Add breathing animation
        const circle = d3.select(event.currentTarget);
        if (selectedNode === d.data.id) {
          circle.classed("breathing", true);
        } else {
          circle.classed("breathing", false);
        }
      });
    
    // Add text labels to nodes
    node.append("text")
      .text(d => d.data.name)
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "#fff")
      .attr("font-size", "12px");
    
    // Add "+" buttons for expansion
    node.each(function(d) {
      const nodeGroup = d3.select(this);
      
      // Add top "+" button for adding parent (only for root nodes)
      if (d.data.parentId === null) {
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
            addParentNode(d.data.id);
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
            addParentNode(d.data.id);
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
          addSiblingNode(d.data.id);
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
          addSiblingNode(d.data.id);
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
          addChildNode(d.data.id);
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
          addChildNode(d.data.id);
        });
    });
    
    // Add info callouts for selected node
    svg.on("click", () => {
      setSelectedNode(null);
      d3.selectAll("circle").classed("breathing", false);
    });
    
    // Center the tree initially with better positioning
    // Calculate the bounding box of the tree
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    root.descendants().forEach(d => {
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
    
    // Drag functions - modified for tree structure
    function dragstarted(event, d) {
      // Only allow horizontal dragging to maintain tree structure
      d.fx = d.x;
    }
    
    function dragged(event, d) {
      // Only allow horizontal movement to maintain tree structure
      d.fx = event.x;
      
      // Update the links
      link.attr("d", link => {
        if (link.source === d) {
          return `M${d.fx},${d.y}
                  C${d.fx},${(d.y + link.target.y) / 2}
                   ${link.target.x},${(d.y + link.target.y) / 2}
                   ${link.target.x},${link.target.y}`;
        } else if (link.target === d) {
          return `M${link.source.x},${link.source.y}
                  C${link.source.x},${(link.source.y + d.y) / 2}
                   ${d.fx},${(link.source.y + d.y) / 2}
                   ${d.fx},${d.y}`;
        } else {
          return `M${link.source.x},${link.source.y}
                  C${link.source.x},${(link.source.y + link.target.y) / 2}
                   ${link.target.x},${(link.source.y + link.target.y) / 2}
                   ${link.target.x},${link.target.y}`;
        }
      });
      
      // Update the node position
      d3.select(event.sourceEvent.target.parentNode)
        .attr("transform", `translate(${d.fx},${d.y})`);
    }
    
    function dragended(event, d) {
      d.x = d.fx;
      d.fx = null;
    }
    
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
          <li>Drag nodes horizontally to reposition them</li>
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