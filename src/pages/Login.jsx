import { useState, useEffect } from "react";
import { FaFacebookF, FaWhatsapp, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import login from "../assets/images/login.jpg";
import LoginLogo from "../components/LoginLogo";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Login() {
  const navigate = useNavigate();

  // ================= STATES =================
  const [step, setStep] = useState("login"); // login | forget | otp | reset
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ idNumber: "", password: "" });
  const [formData, setFormData] = useState({ idNumber: "", password: "" });
  const [forgetData, setForgetData] = useState({ idNumber: "", contact: "" });
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [timer, setTimer] = useState(0);

  // ================= OTP TIMER =================
  useEffect(() => {
    if (step !== "otp" || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  // ================= HANDLERS =================
  const handleLoginChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleForgetChange = (e) =>
    setForgetData({ ...forgetData, [e.target.name]: e.target.value });

  const handleLogin = (e) => {
    e.preventDefault();
    let tempErrors = {};
    if (!formData.idNumber) tempErrors.idNumber = "ID Number required";
    if (!formData.password) tempErrors.password = "Password required";
    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    const savedPassword = localStorage.getItem("dummyPassword");
    if (savedPassword && formData.password !== savedPassword) {
      alert("Wrong password ❌");
      return;
    }

    let role = "student"; // default
    if (formData.idNumber === "A001") role = "admin";
    else if (formData.idNumber === "S001") role = "school";
    else if (formData.idNumber === "T001") role = "teacher";

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("role", role);
    localStorage.setItem("dummyID", formData.idNumber);

    alert(`Login Successful ✅ Role: ${role}`);

    switch (role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "teacher":
        navigate("/teacher/dashboard");
        break;
      case "school":
        navigate("/school/dashboard");
        break;
      default:
        navigate("/student/dashboard");
    }
  };

  // ================= OTP / RESET =================
  const generateOtp = () => {
    const otpCode = "123456"; // dummy
    localStorage.setItem("dummyOtp", otpCode);
    console.log("OTP:", otpCode);
    setTimer(60);
  };

  const sendOtp = () => {
    if (!forgetData.idNumber || !forgetData.contact) {
      alert("ID Number and Email/Phone required");
      return;
    }
    generateOtp();
    alert("OTP sent (check console)");
    setStep("otp");
  };

  const resendOtp = () => {
    generateOtp();
    alert("OTP resent");
  };

  const verifyOtp = () => {
    if (otp === localStorage.getItem("dummyOtp")) {
      alert("OTP verified ✅");
      setStep("reset");
    } else {
      alert("Invalid OTP ❌");
    }
  };

  const resetPassword = () => {
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    localStorage.setItem("dummyPassword", newPassword);
    alert("Password reset successful ✅");
    setStep("login");
  };

  // ================= COMMON STYLES =================
  const cardClasses =
    "bg-white shadow-lg px-8 py-12 animate-fade-in-up relative my-20";
  const titleClasses = "text-2xl font-bold text-gray-600 text-center mb-6";
  const inputWrapper = "relative";
  const buttonFull = "w-full";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl w-full items-center">
        {/* Left Side */}
        <div className="hidden md:block animate-fade-in-left">
          <h1 className="text-4xl text-gray-600 font-bold mb-4">
            Sign in to
            <span
              style={{ textShadow: "3px 3px 5px yellow" }}
              className="animate-glow ml-3"
            >
              <span className="text-indigo-800"> Astha</span>
              <span className="text-gray-300">Academy</span>
            </span>
          </h1>
          <p className="text-gray-600 mb-2">
            If you don’t have an account register
          </p>
          <Link
            to="register"
            className="font-semibold text-blue-600 hover:underline"
          >
            You can Register here !
          </Link>

          <div className="relative cursor-pointer transform scale-90 transition-all duration-900 delay-200 hover:scale-105 hover:rotate-2 hover:brightness-110 hover:shadow-[0_10px_20px_rgba(99,102,241,0.4)]">
            <div className="absolute -top-6 -left-6 rounded-3xl bg-indigo-500/30 h-auto w-auto md:h-full md:w-full" />
            <img
              src={login}
              alt="login"
              className="mt-12 relative z-10 rounded-3xl shadow-2xl"
            />
          </div>
        </div>

        {/* Right Side Card */}
        <div className={cardClasses}>
         <div className="mt-6">
           <LoginLogo />
         </div>

          {/* ===== LOGIN STEP ===== */}
          {step === "login" && (
            <div>
              <h2 className={titleClasses}>Login</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className={inputWrapper}>
                  <Input
                    name="idNumber"
                    label="ID Number"
                    value={formData.idNumber}
                    onChange={handleLoginChange}
                  />
                  {errors.idNumber && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.idNumber}
                    </p>
                  )}
                </div>

                <div className={inputWrapper}>
                  <Input
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleLoginChange}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button className="w-1/2" onClick={() => setStep("forget")}>
                    Forget
                  </Button>
                  <Button className="w-1/2" type="submit">
                    Login
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* ===== FORGET STEP ===== */}
          {step === "forget" && (
            <div>
              <h2 className={titleClasses}>Forget Password</h2>
              <div className="space-y-4">
                <Input
                  name="idNumber"
                  label="ID Number"
                  value={forgetData.idNumber}
                  onChange={handleForgetChange}
                />
                <Input
                  name="contact"
                  label="Email or Phone"
                  value={forgetData.contact}
                  onChange={handleForgetChange}
                />
                <Button className={buttonFull} onClick={sendOtp}>
                  Send OTP
                </Button>
                <p
                  className="text-center text-sm text-blue-600 cursor-pointer"
                  onClick={() => setStep("login")}
                >
                  Back to Login
                </p>
              </div>
            </div>
          )}

          {/* ===== OTP STEP ===== */}
          {step === "otp" && (
            <div className="space-y-4">
              <h2 className={titleClasses}>Verify OTP</h2>
              <p className="text-center text-sm text-gray-500">
                Time left: {timer}s
              </p>
              <Input
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button className={buttonFull} onClick={verifyOtp}>
                Verify OTP
              </Button>
              {timer === 0 && (
                <p
                  onClick={resendOtp}
                  className="text-center text-sm text-blue-600 cursor-pointer"
                >
                  Resend OTP
                </p>
              )}
            </div>
          )}

          {/* ===== RESET PASSWORD STEP ===== */}
          {step === "reset" && (
            <div className="space-y-4">
              <h2 className={titleClasses}>New Password</h2>
              <Input
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button className={buttonFull} onClick={resetPassword}>
                Reset Password
              </Button>
            </div>
          )}

          {/* ===== REGISTER LINK ===== */}
          <p className="h-8 border border-gray-300 flex items-center justify-center text-sm text-gray-500 mt-6">
            <Link to="register">
              Don’t have an account?{" "}
              <span className="text-blue-600 font-semibold">Register</span>
            </Link>
          </p>

          {/* ===== SOCIAL ===== */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-5">Join our Group</p>
            <div className="flex justify-center gap-4">
              <div className="bg-blue-600 text-white p-3 md:p-5 rounded-full cursor-pointer hover:scale-105 transition-all duration-500">
                <FaFacebookF />
              </div>
              <div className="bg-green-500 text-white p-3 md:p-5 rounded-full cursor-pointer hover:scale-105 transition-all duration-500">
                <FaWhatsapp />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
