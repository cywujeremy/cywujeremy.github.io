import React from "react";
import "./styles/TechStack.css";

const TechStack = () => {
	const technologies = [
		{
			category: "Frontend",
			techs: ["React", "D3.js", "HTML5", "CSS3", "JavaScript"]
		},
		{
			category: "Backend",
			techs: ["Node.js", "Express", "Python", "Flask"]
		},
		{
			category: "Data Processing",
			techs: ["Natural Language Processing (NLP)", "spaCy", "NLTK", "Wikipedia API"]
		},
		{
			category: "Visualization",
			techs: ["Force-directed graphs", "SVG", "Canvas", "WebGL"]
		},
		{
			category: "Deployment",
			techs: ["Docker", "AWS", "Vercel", "Netlify"]
		}
	];

	return (
		<div className="wikigraph-tech-stack">
			<h2 className="section-title">Technology Stack</h2>
			<div className="tech-stack-content">
				<p className="tech-intro">
					WikiGraph is built using modern web technologies and advanced natural language processing 
					to deliver a seamless and powerful knowledge visualization experience:
				</p>
				<div className="tech-categories">
					{technologies.map((techCategory, index) => (
						<div className="tech-category" key={index}>
							<h3 className="category-title">{techCategory.category}</h3>
							<ul className="tech-list">
								{techCategory.techs.map((tech, techIndex) => (
									<li key={techIndex} className="tech-item">{tech}</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default TechStack; 