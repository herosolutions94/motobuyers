import React from "react";

const FormProcessingSpinner = ({ isFormProcessing }) => {
  return (
    <>
      <i className={isFormProcessing ? "spinner" : "spinner spinnerHidden"}></i>
    </>
  );
};

export default FormProcessingSpinner;