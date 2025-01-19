import React, { useState } from 'react';
import { MessageSquare, X, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Ensure all required fields are filled
            if (!formData.name || !formData.email || !formData.message) {
                throw new Error('Please fill in all fields');
            }

            // Log the data being sent
            console.log('Sending data:', formData);

            const response = await fetch('/.netlify/functions/create-feedback-issue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            let data;
            try {
                const textResponse = await response.text();
                console.log('Raw response:', textResponse);
                data = JSON.parse(textResponse);
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                throw new Error('Invalid response from server');

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to submit feedback');
                }

                setSubmitStatus({
                    type: 'success',
                    message: 'Feedback submitted successfully! Thank you.'
                });

                // Reset form
                setFormData({ name: '', email: '', message: '' });

                // Close modal after 2 seconds
                setTimeout(() => {
                    setIsOpen(false);
                    setSubmitStatus(null);
                }, 2000);
            } catch (error) {
                console.error('Error:', error);
                setSubmitStatus({
                    type: 'error',
                    message: error.message || 'Something went wrong. Please try again.'
                });
            } finally {
                setIsSubmitting(false);
            }
        };

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

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 p-1 rounded-3xl max-w-md w-full">
                    <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-6 w-full">
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

                        {submitStatus && (
                            <Alert className={`mb-4 ${
                                submitStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                            } bg-opacity-20 text-white border-none`}>
                                <AlertDescription>{submitStatus.message}</AlertDescription>
                            </Alert>
                        )}

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