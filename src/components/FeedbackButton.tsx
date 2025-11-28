import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { notifications } from '../utils/notifications';
import { submitFeedback } from '../utils/feedbackService';

export const FeedbackButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'feature_request'>('feedback');
  const [rating, setRating] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      notifications.error('Please enter your feedback or feature request', { title: 'Required Field' });
      return;
    }

    if (feedbackType === 'feedback' && !rating) {
      notifications.error('Please select a rating', { title: 'Required Field' });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        type: feedbackType,
        rating: feedbackType === 'feedback' ? parseInt(rating) : undefined,
        message: message.trim(),
      });

      notifications.success(
        feedbackType === 'feedback' 
          ? 'Thank you for your feedback!' 
          : 'Thank you for your feature request!',
        { title: 'Submitted Successfully' }
      );

      // Reset form
      setMessage('');
      setRating('');
      setFeedbackType('feedback');
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      notifications.error('Failed to submit feedback. Please try again.', { title: 'Error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
        aria-label="Provide Feedback"
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Feedback Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Share Your Feedback
            </DialogTitle>
            <DialogDescription>
              Help us improve Adiology by sharing your thoughts, feedback, or feature requests.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Feedback Type Selection */}
            <div className="space-y-2">
              <Label>What would you like to share?</Label>
              <Select value={feedbackType} onValueChange={(value: 'feedback' | 'feature_request') => setFeedbackType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feedback">General Feedback</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating (only for feedback) */}
            {feedbackType === 'feedback' && (
              <div className="space-y-3">
                <Label>How would you rate your experience?</Label>
                <RadioGroup value={rating} onValueChange={setRating} className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="rating-1" />
                    <Label htmlFor="rating-1" className="cursor-pointer">1 - Poor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="rating-2" />
                    <Label htmlFor="rating-2" className="cursor-pointer">2 - Fair</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="rating-3" />
                    <Label htmlFor="rating-3" className="cursor-pointer">3 - Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="rating-4" />
                    <Label htmlFor="rating-4" className="cursor-pointer">4 - Very Good</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="rating-5" />
                    <Label htmlFor="rating-5" className="cursor-pointer">5 - Excellent</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="feedback-message">
                {feedbackType === 'feedback' ? 'Your Feedback' : 'Feature Request Details'}
              </Label>
              <Textarea
                id="feedback-message"
                placeholder={
                  feedbackType === 'feedback'
                    ? 'Tell us what you think about Adiology...'
                    : 'Describe the feature you would like to see...'
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-slate-500">
                {feedbackType === 'feature_request' && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Be as detailed as possible to help us understand your needs
                  </span>
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !message.trim()}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit {feedbackType === 'feature_request' ? 'Request' : 'Feedback'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

