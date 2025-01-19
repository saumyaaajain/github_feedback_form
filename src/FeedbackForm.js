import React, { useState } from 'react';
import { MessageSquare, X, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './Alert';

const FeedbackForm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Validate form data
            if (!formData.name || !formData.email || !formData.message) {
                throw new Error('Please fill in all fields');
            }

            // Log the data being sent
            console.log('Submitting form data:', formData);

            // Make the API request
            const response = await fetch('/.netlify/functions/create-feedback-issue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    message: formData.message.trim()
                })
            });

            // Log the raw response for debugging
            const responseText = await response.text();
            console.log('Raw server response:', responseText);

            // Parse the response
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (err) {
                console.error('Error parsing response:', err);
                throw new Error('Invalid server response');
            }

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit feedback');
            }

            // Handle success
            setSubmitStatus({
                type: 'success',
                message: 'Feedback submitted successfully! Thank you.'
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                message: ''
            });

            // Close modal after success
            setTimeout(() => {
                setIsOpen(false);
                setSubmitStatus(null);
            }, 2000);

        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus({
                type: 'error',
                message: error.message || 'Something went wrong. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render floating button when form is closed
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 rounded-full bg-white bg-opacity-20 backdrop-blur-lg hover:bg-opacity-30 transition-all hover:scale-110 text-white shadow-lg"
                aria-label="Open feedback form"
            >
                <MessageSquare className="w-6 h-6" />
            </button>
        );
    }

    // Render form modal when open
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 p-1 rounded-3xl max-w-md w-full">
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-6 w-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Submit Feedback</h2>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setSubmitStatus(null);
                            }}
                            className="text-white hover:opacity-70 transition-opacity"
                            aria-label="Close feedback form"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Status Alert */}
                    {submitStatus && (
                        <Alert className={`mb-4 ${
                            submitStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        } bg-opacity-20 text-white border-none`}>
                            <AlertDescription>{submitStatus.message}</AlertDescription>
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className="w-full px-4 py-2 rounded-xl bg-white bg-opacity-20 placeholder-white placeholder-opacity-60 text-white border-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className="w-full px-4 py-2 rounded-xl bg-white bg-opacity-20 placeholder-white placeholder-opacity-60 text-white border-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <textarea
                                name="message"
                                placeholder="Your feedback"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                rows="4"
                                className="w-full px-4 py-2 rounded-xl bg-white bg-opacity-20 placeholder-white placeholder-opacity-60 text-white border-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all resize-none disabled:opacity-50"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2 rounded-xl bg-white text-purple-600 font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Feedback'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeedbackForm;