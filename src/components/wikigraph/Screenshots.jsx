import React from "react";
import "./styles/Screenshots.css";

const Screenshots = () => {
	// Placeholder for future screenshots
	// In a real implementation, you would import actual images
	const screenshots = [
		{
			title: "Knowledge Graph Visualization",
			description: "Interactive visualization of concepts extracted from a Wikipedia article on Artificial Intelligence.",
			imagePlaceholder: "AI Knowledge Graph"
		},
		{
			title: "Search Interface",
			description: "Clean, intuitive search interface for finding Wikipedia articles to visualize.",
			imagePlaceholder: "Search Interface"
		},
		{
			title: "Concept Details View",
			description: "Detailed view of a selected concept showing related information and connections.",
			imagePlaceholder: "Concept Details"
		}
	];

	return (
		<div className="wikigraph-screenshots">
			<h2 className="section-title">Visual Preview</h2>
			<div className="screenshots-content">
				<p className="screenshots-intro">
					Below are conceptual previews of the WikiGraph interface and visualizations. 
					As the project develops, these will be replaced with actual screenshots of the working application.
				</p>
				<div className="screenshots-grid">
					{screenshots.map((screenshot, index) => (
						<div className="screenshot-card" key={index}>
							<div className="screenshot-placeholder">
								{/* This would be replaced with an actual image in the future */}
								<div className="placeholder-text">{screenshot.imagePlaceholder}</div>
							</div>
							<h3 className="screenshot-title">{screenshot.title}</h3>
							<p className="screenshot-description">{screenshot.description}</p>
						</div>
					))}
				</div>
				<div className="coming-soon">
					<p>Interactive demo coming soon!</p>
				</div>
			</div>
		</div>
	);
};

export default Screenshots; 