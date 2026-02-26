import { useState } from 'react';
import { toast } from 'sonner';
import { Send, MapPin, Mail, Clock } from 'lucide-react';
import { SiInstagram, SiBehance } from 'react-icons/si';
import { SiX } from 'react-icons/si';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = 'Name is required.';
  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!form.message.trim()) errors.message = 'Message is required.';
  else if (form.message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';
  return errors;
}

export default function Contact() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Message sent! We\'ll be in touch soon.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="pt-16">
      {/* Page Header */}
      <section className="py-20 px-6 bg-card border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-label mb-4">Get in Touch</p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
            Let's <span className="italic text-gold">Connect</span>
          </h1>
          <div className="ink-divider w-24 mx-auto mb-6" />
          <p className="font-cormorant text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Have a question, collaboration idea, or just want to say hello? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <p className="section-label mb-4">Contact Info</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center border border-border flex-shrink-0 mt-0.5">
                    <Mail size={14} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Email</p>
                    <p className="text-sm font-sans text-foreground">hello@hilsaart.guide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center border border-border flex-shrink-0 mt-0.5">
                    <MapPin size={14} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Studio</p>
                    <p className="text-sm font-sans text-foreground">Creative District, Art Quarter</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center border border-border flex-shrink-0 mt-0.5">
                    <Clock size={14} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">Response Time</p>
                    <p className="text-sm font-sans text-foreground">Within 24–48 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="ink-divider" />

            <div>
              <p className="section-label mb-4">Follow Us</p>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-border hover:border-gold hover:text-gold text-muted-foreground transition-all duration-200 group"
                  aria-label="Instagram"
                >
                  <SiInstagram size={16} />
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-border hover:border-gold hover:text-gold text-muted-foreground transition-all duration-200"
                  aria-label="X (Twitter)"
                >
                  <SiX size={16} />
                </a>
                <a
                  href="https://behance.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-border hover:border-gold hover:text-gold text-muted-foreground transition-all duration-200"
                  aria-label="Behance"
                >
                  <SiBehance size={16} />
                </a>
              </div>
            </div>

            <div className="ink-divider" />

            <div className="bg-card border border-border p-6">
              <p className="font-serif text-sm font-semibold text-foreground mb-2">About HILSA-ART</p>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                We're passionate about bridging the gap between photography and fine art. Our AI-powered pipeline brings the atelier experience to everyone.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 bg-card border border-border p-10">
                <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold flex items-center justify-center mb-6">
                  <Send size={24} className="text-gold" />
                </div>
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">Message Sent</h2>
                <div className="ink-divider w-16 mx-auto mb-4" />
                <p className="text-muted-foreground font-sans text-sm leading-relaxed max-w-xs">
                  Thank you for reaching out. We'll review your message and respond within 24–48 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-outline-art mt-8 text-xs"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="bg-card border border-border p-8 md:p-10 space-y-6">
                <div>
                  <p className="section-label mb-6">Send a Message</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground">
                    Full Name <span className="text-gold">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={`rounded-none border-border bg-background font-sans text-sm focus:border-gold focus:ring-gold ${errors.name ? 'border-destructive' : ''}`}
                    disabled={submitting}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive font-sans">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground">
                    Email Address <span className="text-gold">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`rounded-none border-border bg-background font-sans text-sm focus:border-gold focus:ring-gold ${errors.email ? 'border-destructive' : ''}`}
                    disabled={submitting}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive font-sans">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground">
                    Message <span className="text-gold">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project, question, or idea..."
                    rows={6}
                    className={`rounded-none border-border bg-background font-sans text-sm resize-none focus:border-gold focus:ring-gold ${errors.message ? 'border-destructive' : ''}`}
                    disabled={submitting}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive font-sans">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary-art w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
