import React, { useState } from 'react';
import { X } from 'lucide-react';

interface LegalPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'gr24' | 'terms' | 'privacy';
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'gr24' 
}) => {
  const [activeTab, setActiveTab] = useState<'gr24' | 'terms' | 'privacy'>(initialTab);

  // Update tab when initialTab prop changes
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#111] border border-accent p-6 max-w-4xl w-full h-[80vh] flex flex-col shadow-[0_0_30px_rgba(199,167,108,0.1)]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-ink-faint">
          <h2 className="font-oswald text-2xl uppercase tracking-wide text-white">Legal & Compliance</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-accent transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6 border-b border-ink-faint/30 pb-2">
          <button 
            onClick={() => setActiveTab('gr24')}
            className={`font-mono text-[11px] uppercase tracking-wider pb-2 border-b-2 transition-colors ${activeTab === 'gr24' ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-white'}`}
          >
            GR 24 Statement
          </button>
          <button 
            onClick={() => setActiveTab('terms')}
            className={`font-mono text-[11px] uppercase tracking-wider pb-2 border-b-2 transition-colors ${activeTab === 'terms' ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-white'}`}
          >
            Terms & Conditions
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`font-mono text-[11px] uppercase tracking-wider pb-2 border-b-2 transition-colors ${activeTab === 'privacy' ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-white'}`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-4 space-y-6 text-sm text-ink-muted leading-relaxed font-sans">
          
          {activeTab === 'gr24' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">Washington State General Rule 24 Statement</h3>
              <p>
                <strong>Not Legal Advice.</strong> The WA Pro Se Builder application and its creators are <strong>not a law firm, not attorneys, and do not provide legal advice.</strong> 
              </p>
              <p>
                Pursuant to Washington State General Rule (GR) 24, the practice of law involves the application of legal principles and judgment with regard to the circumstances or objectives of another entity or person(s). The services provided by this application are strictly strictly limited to self-help software tools, document assembly, and providing access to publicly available procedural information. 
              </p>
              <p>
                By using this tool, you act as your own attorney (Pro Se). We do not review your answers for legal sufficiency, draw legal conclusions, provide legal advice, opinions, or recommendations about your legal rights, remedies, defenses, options, selection of forms, or strategies. 
              </p>
              <p>
                Your use of this site does not create an attorney-client relationship. If you require legal advice regarding your specific situation, you must consult a licensed attorney in Washington State.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">Terms and Conditions</h3>
              <p><strong>1. Acceptance of Terms</strong><br/>
              By accessing and using WA Pro Se Builder, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use the application.</p>
              
              <p><strong>2. Description of Service</strong><br/>
              WA Pro Se Builder provides automated software tools designed to help individuals represent themselves in legal proceedings in Washington State. The tool assists in formatting and compiling information into standardized court forms.</p>
              
              <p><strong>3. User Responsibility</strong><br/>
              You are solely responsible for the accuracy, completeness, and appropriateness of the information you input into the forms. You are also responsible for filing your documents with the appropriate court and adhering to all local and state court rules, including LCRs and deadlines.</p>
              
              <p><strong>4. Disclaimer of Warranties</strong><br/>
              The services are provided "as is" and "as available" without any warranties of any kind. We do not guarantee that the forms generated will be accepted by the court or that they will achieve your desired legal outcome.</p>

              <p><strong>5. Limitation of Liability</strong><br/>
              To the maximum extent permitted by law, WA Pro Se Builder and its developers shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your use or inability to use the service.</p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">Privacy Policy</h3>
              <p><strong>1. Data Collection and Local Processing</strong><br/>
              WA Pro Se Builder is designed with a privacy-first architecture. The sensitive legal and factual information you enter into the application is processed entirely on your local device (in your browser). We do not transmit or store your sensitive case facts, personal details, or generated court documents on our external servers.</p>
              
              <p><strong>2. Information We Collect</strong><br/>
              We may collect standard, non-identifying telemetry data (such as browser type, timestamps, and error logs) to monitor system performance and improve the application. If you choose to create an account, we store basic authentication credentials (e.g., email address).</p>
              
              <p><strong>3. Payment Processing</strong><br/>
              All payments are securely processed through third-party providers (e.g., PayPal). We do not collect, process, or store your credit card or financial information.</p>
              
              <p><strong>4. Third-Party Sharing</strong><br/>
              Because your case data remains local to your device, we have no sensitive case data to share or sell to third parties.</p>
              
              <p><strong>5. Changes to This Policy</strong><br/>
              We may update this Privacy Policy from time to time. Continued use of the application after changes constitute your acceptance of the revised policy.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
