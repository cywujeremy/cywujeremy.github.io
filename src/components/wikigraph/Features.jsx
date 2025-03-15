import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
	faSearch, 
	faProjectDiagram, 
	faExpand, 
	faDownload, 
	faShareAlt, 
	faLightbulb 
} from "@fortawesome/free-solid-svg-icons";
import "./styles/Features.css";

const Features = () => {
	const featuresList = [
		{
			icon: faSearch,
			title: "Wikipedia Integration",
			description: "Search any Wikipedia page directly from WikiGraph or paste a URL to generate a knowledge graph."
		},
		{
			icon: faProjectDiagram,
			title: "Automatic Graph Generation",
			description: "Extracts key concepts and their relationships automatically using natural language processing."
		},
		{
			icon: faExpand,
			title: "Interactive Exploration",
			description: "Zoom, pan, and click on nodes to expand the graph and discover related concepts."
		},
		{
			icon: faDownload,
			title: "Export Options",
			description: "Save your knowledge graphs as images or interactive HTML files to share or embed."
		},
		{
			icon: faShareAlt,
			title: "Sharing Capabilities",
			description: "Generate shareable links to your knowledge graphs for collaboration."
		},
		{
			icon: faLightbulb,
			title: "Concept Insights",
			description: "Get detailed information about each concept with direct links back to Wikipedia."
		}
	];

	return (
		<div className="wikigraph-features">
			<h2 className="section-title">Key Features</h2>
			<div className="features-grid">
				{featuresList.map((feature, index) => (
					<div className="feature-card" key={index}>
						<div className="feature-icon">
							<FontAwesomeIcon icon={feature.icon} />
						</div>
						<h3 className="feature-title">{feature.title}</h3>
						<p className="feature-description">{feature.description}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default Features; 