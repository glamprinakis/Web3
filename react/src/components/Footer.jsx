import React from "react";
import { Link } from "react-router-dom";

import '../assets/styles/Footer.css';

function Footer() {
	return (
		<footer className="footer-distributed border-top" style={{marginTop: '7.5rem'}}>
			<div className="footer-left">
				<h3>Lamprinakis<span>-Eshop</span>.</h3>
				<p className="footer-company-name">Lamprinakis-Eshop © 2025</p>
			</div>
			<div className="footer-center">
				<div>
					<i className="bi bi-pin-map"></i>
					<p>Καραϊσκάκη 82<br />Χανια 73100</p>
				</div>
				<div>
					<i className="bi bi-phone"></i>
					<p>+30 694 804 2634</p>
				</div>
				<div>
					<i className="bi bi-envelope"></i>
					<p><Link to="mailto:info@lamprinakis-eshop.gr">info@lamprinakis-eshop.gr</Link></p>
				</div>
			</div>
			<div className="footer-right">
				<p className="footer-company-about">
					<span>Η ιστοσελίδα μου</span>
					Αυτή η ιστοσελίδα δημιουργήθηκε στο πλαίσιο προσωπικής εξάσκησης και εξέλιξης σε σύγχρονες τεχνολογίες ανάπτυξης εφαρμογών. Περιλαμβάνει πλήρως λειτουργικό e‑commerce σύστημα βασισμένο σε React, Node.js, MySQL και phpMyAdmin, με containerization μέσω Docker, Nginx με SSL, και αυτόματες αναπτύξεις (CI/CD) με GitHub Actions. Η υποδομή φιλοξενείται σε AWS EC2 και εξελίσσεται με πρακτικές Infrastructure as Code (IaC).
				</p>
				<div className="footer-icons">
				<a href="https://www.linkedin.com/in/georgios-lamprinakis/" target="_blank" rel="noopener noreferrer">
					<i className="bi bi-linkedin"></i>
				</a>
				<a href="https://github.com/glamprinakis" target="_blank" rel="noopener noreferrer">
					<i className="bi bi-github"></i>
				</a>
				<a href="tel:+306948042634">
					<i className="bi bi-telephone"></i>
				</a>
				</div>

			</div>
		</footer>
	)
}

export default Footer;