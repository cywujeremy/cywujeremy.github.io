import React from "react";
import "./styles/Overview.css";

const Overview = () => {
	return (
		<div className="wikigraph-overview">
			<h2 className="section-title">Project Overview</h2>
			<div className="overview-content">
				<p>
					WikiGraph is a powerful tool that transforms Wikipedia pages into interactive knowledge graphs, 
					helping users visualize connections between concepts and explore related information in an intuitive way.
				</p>
				<p>
					By simply entering a Wikipedia page URL or search term, WikiGraph automatically extracts key concepts, 
					identifies relationships between them, and generates a beautiful, interactive graph visualization that 
					makes complex information easier to understand and navigate.
				</p>
				<p>
					Whether you're a student researching a topic, a professional exploring a new field, or simply a curious 
					mind wanting to understand connections between ideas, WikiGraph helps you discover and visualize knowledge 
					in a whole new way.
				</p>
			</div>
		</div>
	);
};

export default Overview; 