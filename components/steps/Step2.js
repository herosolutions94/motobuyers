import { useFormContext, Controller } from "react-hook-form";

export default function Step2() {
  const {
    register,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useFormContext();
  const ridden = watch("ridden");

  return (
    <div className="steps__section">
      <h1 className="steps__title">Tell us a bit more about your bike</h1>

      <div className="steps__single-col">
        <div className="steps__form-card">
          {/* Mileage */}
          <label className="steps__field-label">Mileage</label>
          <p className="steps__field-hint">To the best of your knowledge</p>
          <div className="steps__input-wrap">
            <input
              {...register("mileage", {
                required: "Please enter the mileage",
                validate: (v) => {
                  const num = parseInt(String(v).replace(/,/g, ""), 10);
                  return (
                    (!isNaN(num) && num >= 0) || "Please enter a valid mileage"
                  );
                },
              })}
              type="text"
              inputMode="numeric"
              className={`steps__input steps__input--suffix${errors.mileage ? " steps__input--error" : ""}`}
              placeholder="Enter mileage"
              onChange={(e) => {
                let raw = e.target.value.replace(/[^0-9]/g, "");
                if (!raw) {
                  setValue("mileage", "", { shouldValidate: true });
                  return;
                }

                // commas format
                const formatted = new Intl.NumberFormat().format(raw);

                setValue("mileage", formatted, { shouldValidate: true });
              }}
            />

            {/* <input
              {...register("mileage", {
                required: "Please enter the mileage",
                validate: (v) => {
                  const num = parseInt(v, 10);
                  return (
                    (!isNaN(num) && num >= 0) || "Please enter a valid mileage"
                  );
                },
              })}
              type="text"
              inputMode="numeric"
              className={`steps__input steps__input--suffix${errors.mileage ? " steps__input--error" : ""}`}
              placeholder="Enter mileage"
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                setValue("mileage", onlyNumbers, { shouldValidate: true });
              }}
            /> */}
            {/* phly */}
            {/* <input
              {...register("mileage", {
                required: "Please enter the mileage",
                validate: (v) => {
                  const num = parseInt(String(v).replace(/,/g, ""), 10);
                  return (
                    (!isNaN(num) && num >= 0) || "Please enter a valid mileage"
                  );
                },
              })}
              type="number"
              className={`steps__input steps__input--suffix${errors.mileage ? " steps__input--error" : ""}`}
              placeholder="Enter mileage"
            /> */}
            <span className="steps__input-suffix">miles</span>
          </div>
          {errors.mileage && (
            <p className="steps__field-error">{errors.mileage.message}</p>
          )}

          {/* ZIP */}
          <label className="steps__field-label" style={{ marginTop: "2rem" }}>
            ZIP code
          </label>
          <input
            {...register("zip", {
              required: "Please enter your ZIP code",
              // minLength: {
              //   value: 5,
              //   message: "ZIP code must be 5 digits",
              // },
              // maxLength: {
              //   value: 9,
              //   message: "ZIP code cannot exceed 9 digits",
              // },
            })}
            type="text"
            inputMode="numeric"
            className={`steps__input${errors.zip ? " steps__input--error" : ""}`}
            placeholder="Enter Zip code"
            maxLength={5}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setValue("zip", value, { shouldValidate: true });
            }}
          />
          {/* <input
            {...register("zip", {
              required: "Please enter your ZIP code",
              pattern: {
                value: /^\d{5}(-\d{4})?$/,
                message: "Please enter a valid ZIP code",
              },
            })}
            type="text"
            className={`steps__input${errors.zip ? " steps__input--error" : ""}`}
            placeholder="Enter Zip code"
            maxLength={10}
          /> */}
          {errors.zip && (
            <p className="steps__field-error">{errors.zip.message}</p>
          )}

          {/* Ridden in last 30 days */}
          <label className="steps__field-label" style={{ marginTop: "2rem" }}>
            Has this bike been ridden in the last 30 days?
          </label>
          <Controller
            name="ridden"
            control={control}
            rules={{ required: "Please select an option" }}
            render={({ field }) => (
              <div className="steps__yesno">
                {["Yes", "No"].map((opt) => {
                  const val = opt.toLowerCase();
                  return (
                    <button
                      key={opt}
                      type="button"
                      className={`steps__yesno-btn ${field.value === val ? "steps__yesno-btn--active" : ""}`}
                      onClick={() => field.onChange(val)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.ridden && (
            <p className="steps__field-error">{errors.ridden.message}</p>
          )}

          {/* Email */}
          <label className="steps__field-label" style={{ marginTop: "2rem" }}>
            Email address
          </label>
          <p className="steps__field-hint">We send your offer here</p>
          <input
            {...register("email", {
              required: "Please enter your email address",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
            type="email"
            className={`steps__input${errors.email ? " steps__input--error" : ""}`}
            placeholder="e.g. name@email.com"
          />
          {errors.email && (
            <p className="steps__field-error">{errors.email.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
