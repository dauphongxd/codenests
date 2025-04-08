// src/components/Modal.jsx
import React from 'react';

const Modal = ({ children, headerContent, bodyContent }) => {
    return (
        <div className="shadow-lg flex flex-col m-auto bg-dark overflow-hidden border border-orchid/10 rounded-3xl max-w-[400px] w-full">
            <div className="flex flex-col items-center border-b border-[#0D0C10] p-6">
                {headerContent}
            </div>
            <div className="flex flex-col border-t border-orchid/10 p-6">
                {bodyContent}
            </div>
        </div>
    );
};

export default Modal;