import { useFormContext } from "react-hook-form";
import InputMask from "react-input-mask";

export default function Step6() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <section className="steps__section">
      <h1 className="steps__title">How can we reach you?</h1>
      <p className="steps__subtitle">
        We will use this information to follow up with your appraisal.
      </p>

      <div className="steps__single-col">
        <div className="steps__form-card">
          <div className="steps__contact-field">
            <label className="steps__field-label !mb-[0]">Full Name</label>
            <input
              {...register("firstName", {
                required: "Please enter your full name",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters",
                },
              })}
              type="text"
              className={`steps__input steps__input--rect${errors.firstName ? " steps__input--error" : ""}`}
              placeholder="Enter your full name"
            />
            {errors.firstName && (
              <p className="steps__field-error">{errors.firstName.message}</p>
            )}
          </div>

          <div className="steps__contact-field" style={{ marginTop: "2rem" }}>
            <label className="steps__field-label !mb-[0]">Phone Number</label>
            <InputMask
              mask="(999) 999-9999"
              {...register("phone", {
                required: "Please enter your phone number",
              })}
            >
              {(inputProps) => (
                <input
                  {...inputProps}
                  type="tel"
                  className={`steps__input steps__input--rect${errors.phone ? " steps__input--error" : ""}`}
                  placeholder="(555) 000-0000"
                />
              )}
            </InputMask>
            {errors.phone && (
              <p className="steps__field-error">{errors.phone.message}</p>
            )}
          </div>

          <div className="steps__contact-field" style={{ marginTop: "2rem" }}>
            <label className="steps__field-label !mb-[0]">Email Address</label>
            <input
              {...register("contactEmail", {
                required: "Please enter your email address",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
              type="email"
              className={`steps__input steps__input--rect${errors.contactEmail ? " steps__input--error" : ""}`}
              placeholder="you@example.com"
            />
            {errors.contactEmail && (
              <p className="steps__field-error">
                {errors.contactEmail.message}
              </p>
            )}
          </div>

          <div className="steps__contact-field" style={{ marginTop: "2rem" }}>
            <label className="steps__field-label !mb-[0]">
              Anything else we should know?
            </label>
            <textarea
              {...register("notes")}
              rows={5}
              placeholder="Add any details that might affect the offer..."
              className="steps__input steps__input--rect"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
