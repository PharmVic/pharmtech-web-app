
import React from 'react';

export default function Help() {
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8 text-center">
                    <h1 className="display-4 font-bold mb-4">Help & Support</h1>
                    <p className="lead text-gray-600 mb-5">
                        How can we help you today? Check our FAQs or contact support.
                    </p>

                    <div className="row g-4 text-start">
                        <div className="col-md-6">
                            <div className="p-4 border rounded shadow-sm">
                                <h3 className="h5 font-bold mb-3">Frequently Asked Questions</h3>
                                <ul className="list-unstyled">
                                    <li className="mb-2"><a href="#" className="text-decoration-none">How do I reset my password?</a></li>
                                    <li className="mb-2"><a href="#" className="text-decoration-none">Where is my order?</a></li>
                                    <li className="mb-2"><a href="#" className="text-decoration-none">How to return an item?</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="p-4 border rounded shadow-sm">
                                <h3 className="h5 font-bold mb-3">Contact Support</h3>
                                <p className="mb-2">Email: support@pharmtechsolar.com</p>
                                <p className="mb-2">Phone: +234 815 640 1629</p>
                                <button className="btn btn-primary text-white mt-2">Contact Us</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
