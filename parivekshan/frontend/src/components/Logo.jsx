import React from 'react'

export default function Logo({ className = '', variant = 'full' }) {
  if (variant === 'icon') {
    return (
      <svg className={className} viewBox="0 0 50 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(4, 8)">
          <path d="M24 2L6 10V24C6 36.8 13.8 48.4 24 51C34.2 48.4 42 36.8 42 24V10L24 2Z" fill="#0F2C59" stroke="#0e7c66" strokeWidth="2.5" strokeLinejoin="round"/>
          <path d="M14 26C18 20 30 20 34 26" stroke="#bef264" strokeWidth="2" strokeLinecap="round"/>
          <path d="M18 33C21 29 27 29 30 33" stroke="#bef264" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="24" cy="22" r="3.5" fill="#0e7c66"/>
          <circle cx="24" cy="22" r="6.5" stroke="#0e7c66" strokeOpacity="0.4" strokeWidth="1.5"/>
          <path d="M24 26V36M18 36H30" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
        </g>
      </svg>
    )
  }

  return (
    <svg className={className} viewBox="0 0 320 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(4, 8)">
        <path d="M24 2L6 10V24C6 36.8 13.8 48.4 24 51C34.2 48.4 42 36.8 42 24V10L24 2Z" fill="#0F2C59" stroke="#0e7c66" strokeWidth="2.5" strokeLinejoin="round"/>
        <path d="M14 26C18 20 30 20 34 26" stroke="#bef264" strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 33C21 29 27 29 30 33" stroke="#bef264" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="22" r="3.5" fill="#0e7c66"/>
        <circle cx="24" cy="22" r="6.5" stroke="#0e7c66" strokeOpacity="0.4" strokeWidth="1.5"/>
        <path d="M24 26V36M18 36H30" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
      <text x="60" y="33" fill="#0F2C59" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="21" letterSpacing="-0.02em">Parivekshan</text>
      <rect x="225" y="16" width="34" height="22" rx="4" fill="#0e7c66" fillOpacity="0.12" stroke="#0e7c66" strokeWidth="1" />
      <text x="231" y="31" fill="#0e7c66" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="12" letterSpacing="0.04em">AI</text>
      <text x="61" y="47" fill="#8495b1" fontFamily="'JetBrains Mono', monospace" fontWeight="500" fontSize="8.5" letterSpacing="0.08em">PREDICTIVE INFRASTRUCTURE SUITE</text>
    </svg>
  )
}