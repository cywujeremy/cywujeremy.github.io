import React, { useEffect } from "react";
import { Helmet } from "react-helmet";

import NavBar from "../components/common/navBar";
import Footer from "../components/common/footer";
import Logo from "../components/common/logo";

import Overview from "../components/wikigraph/Overview";
import Features from "../components/wikigraph/Features";
import TechStack from "../components/wikigraph/TechStack";
import Screenshots from "../components/wikigraph/Screenshots";

import INFO from "../data/user";
import SEO from "../data/seo";

import "./styles/wikigraph.css";

const WikiGraph = () => {
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	// Find SEO data or use default if not available yet
	const currentSEO = SEO.find((item) => item.page === "wikigraph") || {
		description: "WikiGraph - A tool to generate knowledge graphs from Wikipedia pages",
		keywords: ["wikigraph", "knowledge graph", "wikipedia", "visualization", "concept mapping"],
	};

	return (
		<React.Fragment>
			<Helmet>
				<title>{`WikiGraph | ${INFO.main.title}`}</title>
				<meta name="description" content={currentSEO.description} />
				<meta
					name="keywords"
					content={currentSEO.keywords.join(", ")}
				/>
			</Helmet>

			<div className="page-content">
				<NavBar active="projects" />
				<div className="content-wrapper">
					<div className="wikigraph-logo-container">
						<div className="wikigraph-logo">
							<Logo width={46} />
						</div>
					</div>
					<div className="wikigraph-container">
						<div className="title wikigraph-title">
							WikiGraph
						</div>

						<div className="subtitle wikigraph-subtitle">
							Visualize Wikipedia knowledge as interactive concept graphs
						</div>

						<div className="wikigraph-content">
							<Overview />
							<Features />
							<TechStack />
							<Screenshots />
						</div>
					</div>
					<div className="page-footer">
						<Footer />
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default WikiGraph; 