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
            const response = await fetch('/.netlify/functions/createIssue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitStatus({
                    type: 'success',
                    message: 'Thanks bestie! Your feedback has been submitted ✨'
                });
                // Reset form after successful submission
                setFormData({ name: '', email: '', message: '' });
                // Close modal after 2 seconds
                setTimeout(() => setIsOpen(false), 2000);
            } else {
                throw new Error(data.message || 'Something went wrong');
            }
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: 'Oops! Something went wrong. Try again?'
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
                        <h2 className="text-xl font-bold text-white">spill the tea sis ✨</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:opacity-70 transition-opacity"
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
                                placeholder="your name bestie"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-xl bg-white bg-opacity-20 placeholder-white placeholder-opacity-60 text-white border-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all"
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 rounded-xl bg-white bg-opacity-20 placeholder-white placeholder-opacity-60 text-white border-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all"
                            />
                        </div>

                        <div>
              <textarea
                  name="message"
                  placeholder="what's on your mind?"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 rounded-xl bg-white bg-opacity-20 placeholder-white placeholder-opacity-60 text-white border-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all resize-none"
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
                                    sending...
                                </>
                            ) : (
                                'send it!'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeedbackForm;