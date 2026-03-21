const fs = require('fs');
const css = `
/* Modern Confirm Modal */
.custom-confirm-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}
.custom-confirm-overlay.active {
    opacity: 1;
    visibility: visible;
}
.custom-confirm-modal {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    transform: translateY(20px) scale(0.95);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(255,255,255,0.5);
}
.custom-confirm-overlay.active .custom-confirm-modal {
    transform: translateY(0) scale(1);
}
.confirm-icon {
    width: 60px;
    height: 60px;
    background: #fdf2f8;
    color: #ec4899;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
}
.confirm-icon.success {
    background: #ecfdf5;
    color: #10b981;
}
.custom-confirm-modal h3 {
    margin: 0 0 0.5rem;
    color: #1e293b;
    font-size: 1.25rem;
}
.custom-confirm-modal p {
    color: #64748b;
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
}
.confirm-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}
.confirm-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    flex: 1;
}
.confirm-btn.no-btn {
    background: #f1f5f9;
    color: #475569;
}
.confirm-btn.no-btn:hover {
    background: #e2e8f0;
}
.confirm-btn.yes-btn.danger {
    background: #ef4444;
    color: white;
}
.confirm-btn.yes-btn.danger:hover {
    background: #dc2626;
}
.confirm-btn.yes-btn.success {
    background: #10b981;
    color: white;
}
.confirm-btn.yes-btn.success:hover {
    background: #059669;
}
`;
fs.appendFileSync('css/admin.css', css);
console.log('Appended CSS successfully');
