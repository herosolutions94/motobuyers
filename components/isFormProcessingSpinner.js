import React from "react";

export default function IsFormProcessingSpinner({ isProcessing }) {
    return <>
        {
            isProcessing ?
                <i className="spinner"></i>
                :
                ""
        }
    </>;
}