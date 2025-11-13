// Integration logos - Using colored backgrounds with brand colors

export const IntegrationLogos = {
  mailchimp: () => (
    <div className="w-12 h-12 rounded-xl bg-[#FFE01B] flex items-center justify-center shadow-sm">
      <span className="text-2xl font-bold text-black">M</span>
    </div>
  ),
  convertkit: () => (
    <div className="w-12 h-12 rounded-xl bg-[#FB6970] flex items-center justify-center shadow-sm">
      <span className="text-2xl font-bold text-white">C</span>
    </div>
  ),
  klaviyo: () => (
    <div className="w-12 h-12 rounded-xl bg-[#000000] flex items-center justify-center shadow-sm">
      <span className="text-2xl font-bold text-white">K</span>
    </div>
  ),
  zapier: () => (
    <div className="w-12 h-12 rounded-xl bg-[#FF4A00] flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 12l10 10 10-10L12 2zm0 3.83L18.17 12 12 18.17 5.83 12 12 5.83z"/>
      </svg>
    </div>
  ),
  make: () => (
    <div className="w-12 h-12 rounded-xl bg-[#6D3BFF] flex items-center justify-center shadow-sm">
      <span className="text-2xl font-bold text-white">M</span>
    </div>
  ),
  google_analytics: () => (
    <div className="w-12 h-12 rounded-xl bg-[#F9AB00] flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <path d="M22.84 2.998v17.999a3.003 3.003 0 01-3.003 3.002h-.001a3.003 3.003 0 01-3.003-3.002V2.998a3.003 3.003 0 013.003-3.001h.001a3.003 3.003 0 013.003 3.001zM8.5 8.5a3 3 0 013-3 3 3 0 013 3v12a3 3 0 01-3 3 3 3 0 01-3-3v-12zM3.003 18a3.003 3.003 0 00-3.001 3.001v.002A3.003 3.003 0 003.003 24h.001a3.003 3.003 0 003.001-3.001V21a3.003 3.003 0 00-3.001-3h-.001z"/>
      </svg>
    </div>
  ),
  facebook_pixel: () => (
    <div className="w-12 h-12 rounded-xl bg-[#1877F2] flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    </div>
  ),
  tiktok_pixel: () => (
    <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    </div>
  ),
  stripe: () => (
    <div className="w-12 h-12 rounded-xl bg-[#635BFF] flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
      </svg>
    </div>
  ),
  paypal: () => (
    <div className="w-12 h-12 rounded-xl bg-[#00457C] flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .852-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
      </svg>
    </div>
  ),
  calendly: () => (
    <div className="w-12 h-12 rounded-xl bg-[#006BFF] flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
      </svg>
    </div>
  ),
  cal_com: () => (
    <div className="w-12 h-12 rounded-xl bg-[#292929] flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/>
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
      </svg>
    </div>
  ),
  discord: () => (
    <div className="w-12 h-12 rounded-xl bg-[#5865F2] flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    </div>
  ),
  slack: () => (
    <div className="w-12 h-12 rounded-xl bg-[#4A154B] flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
      </svg>
    </div>
  ),
  twitter_api: () => (
    <div className="w-12 h-12 rounded-xl bg-[#1DA1F2] flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
      </svg>
    </div>
  ),
  instagram_api: () => (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
      </svg>
    </div>
  ),
  custom_webhook: () => (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-sm">
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    </div>
  ),
}
