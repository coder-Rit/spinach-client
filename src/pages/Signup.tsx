import { FormEvent, useState } from "react";
import { useSignup } from "../hooks/useSignup";
import { Lock, Mail, User } from "lucide-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const { signup, error, loading } = useSignup();

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await signup(name, email, password);
  };

  return (
    <form onSubmit={handleSignup} className="signup-form flex flex-col gap-5 py-20 mx-auto max-w-sm">
      <h2 className="text-4xl font-medium text-white mb-10">Sign Up</h2>

      <div className="form-control flex flex-col gap-2 ">
        <label htmlFor="name" className="cursor-pointer hover:text-white duration-300">
          <span className="inline-flex items-center gap-2">
            <User size={14} />
          Name
          </span>
        </label>
        <input
          type="text"
          id="name"
          placeholder="Shubham Singh"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="bg-transparent border border-neutral-500 py-3 px-5 rounded-xl outline-none focus:border-white duration-300"
        />
      </div>

      <div className="form-control flex flex-col gap-2 ">
        <label htmlFor="email" className="cursor-pointer hover:text-white duration-300">
          <span className="inline-flex items-center gap-2">
            <Mail size={14} />
          Email Address
          </span>
        </label>
        <input
          type="email"
          id="email"
          placeholder="tanisha@express.dev"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="bg-transparent border border-neutral-500 py-3 px-5 rounded-xl outline-none focus:border-white duration-300"
        />
      </div>

      <div className="form-control flex flex-col gap-2 ">
        <label htmlFor="password" className="cursor-pointer hover:text-white duration-300">
          <span className="inline-flex items-center gap-2">
            <Lock size={14} />
          Password
          </span>
        </label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="bg-transparent border border-neutral-500 py-3 px-5 rounded-xl outline-none focus:border-white duration-300"
        />
      </div>

      <button
        disabled={loading}
        type="submit"
        className="bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-500 duration-300 mt-3 disabled:opacity-60 font-medium shadow-sm shadow-emerald-950/30"
      >
        Sign Up
      </button>

      {error && (
        <p className="bg-neutral-800 rounded-lg p-5 text-neutral-200 border border-neutral-600">{error}</p>
      )}
    </form>
  );
};

export default Signup;
