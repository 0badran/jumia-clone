import { Card, Input, Button, Typography, Alert, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import Image from "next/image";
import { useForm } from "react-hook-form";
import topLogo from "@/public/1.png";
import bottomLogo from "@/public/bottom-logo.png";
import { auth, firestore } from "@/firebase";
import { useState } from 'react';
import { useCountries } from "use-react-countries";
import { setDoc, doc } from "firebase/firestore";


function CheckIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
}
function WrongIcone() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>

}


function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const router = useRouter();
  const { signup: emailRoute } = router.query;
  const [signupAlert, setSignupAlert] = useState(false);
  const [signupError, setSignupError] = useState(false);
  const { countries } = useCountries();
  const [country, setCountry] = useState(230);
  const { name, flags, countryCallingCode } = countries[country];
  const passwordMatch = watch("password");
  const regx = new RegExp(passwordMatch);

  function createNewUser({ password, username, phone }) {
    createUserWithEmailAndPassword(auth, emailRoute, password)
      .then((userCredential) => {
        const userID = userCredential.user.uid;
        const displayName = userCredential.user.displayName = username;
        const phoneNumber = userCredential.user.phoneNumber = phone;
        const email = userCredential.user.email;
        const emailVerified = userCredential.user.emailVerified;
        // Set new user in users collection.
        setDoc(doc(firestore, "users", userID), { userID, displayName, email, phoneNumber, emailVerified });
        setSignupAlert(true);
        setTimeout(() => { router.push("/"); }, 3000);
      })
      .catch((error) => {
        setSignupError(true);
        setTimeout(() => { setSignupError(false); }, 5000);
      });
  }

  return (
    <Card className="flex flex-col items-center mt-10" shadow={false}>
      <div className="flex flex-col items-center w-[30rem]">
        <Alert icon={<CheckIcon />} className={signupAlert ? "rounded-none border-l-4 border-green-500 bg-green-500/10 font-medium text-green-500 my-8" : "hidden"}>SginUp Success.</Alert>
        <Alert icon={<WrongIcone />} className={signupError ? "rounded-none border-l-4 border-red-500 bg-red-500/10 font-medium text-red-500 my-8" : "hidden"}>Error in Signup.</Alert>
        <Image
          width="70"
          height="70"
          className="object-cover object-center mb-3"
          src={topLogo}
          alt="logo-image"
        />
        <Typography variant="h3" color="black">
          Create your account
        </Typography>
        <Typography color="black" className="mt-1 text-center">
          Let&apos;s get started by creating your account. To keep your account
          safe, we need a strong password
        </Typography>
      </div>
      <form className="mb-20" onSubmit={handleSubmit(createNewUser)}>
        <div className="w-[28rem] mt-20">
          <Input
            size="lg"
            defaultValue={emailRoute}
            disabled
            color="orange"
            label="Enter your email"
          />
        </div>
        <div className="w-[28rem] my-10">
          <Input
            size="lg"
            color="orange"
            label="Type your name"
            {...register("username", {
              required: true,
            })}
          />
        </div>
        <div className="relative flex w-full w-[28rem]">
          <Menu placement="bottom-start">
            <MenuHandler>
              <Button
                ripple={false}
                variant="text"
                color="blue-gray"
                className="flex h-11 items-center gap-2 rounded-r-none border border-r-0 border-blue-gray-200 bg-blue-gray-500/10 pl-3"
              >
                <img
                  src={flags.svg}
                  alt={name}
                  className="h-4 w-4 rounded-full object-cover"
                />
                {countryCallingCode}
              </Button>
            </MenuHandler>
            <MenuList className="max-h-[20rem] max-w-[18rem]">
              {countries.map(({ name, flags, countryCallingCode }, index) => {
                return (
                  <MenuItem
                    key={name}
                    value={name}
                    className="flex items-center gap-2"
                    onClick={() => setCountry(index)}
                  >
                    <img
                      src={flags.svg}
                      alt={name}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    {name} <span className="ml-auto">{countryCallingCode}</span>
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
          <Input
            type="tel"
            size="lg"
            placeholder="Mobile Number"
            color="orange"
            className="rounded-l-none"
            labelProps={{
              className: "before:content-none after:content-none",
            }}
            containerProps={{
              className: "min-w-0",
            }}
            {...register("phone", {
              required: true,
            })}
          />
        </div>
        <div className="w-[28rem] my-10">
          <Input
            type="password"
            size="lg"
            color={errors.password ? "red" : "orange"}
            label="Password"
            {...register("password", {
              required: true,
              pattern: {
                value: /^[a-zA-Z0-9]{8,}/,
                message: "Password must be 8 characters or more.",
              },
            })}
          />
          <p className="text-red-600 text-xs">{errors.password?.message}</p>
        </div>
        <div className="w-[28rem] mb-10">
          <Input
            type="password"
            size="lg"
            color={errors.password2 ? "red" : "orange"}
            label="Confirm Password"
            {...register("password2", {
              required: true,
              pattern: { value: regx, message: "Must to same a password" },
            })}
          />
          <p className="text-red-600 text-xs">{errors.password2?.message}</p>
        </div>
        <Button
          className="text-white mt-6"
          type="submit"
          size="lg"
          color="amber"
          fullWidth
        >
          Continue
        </Button>
      </form>
      <div className="w-[28rem]">
        <Typography color="black" className="text-sm text-center">
          For further support, you may visit the Help Center or contact our
          customer service team.
        </Typography>
        <div className="flex flex-col  items-center mt-5">
          <Image
            width="100"
            height="100"
            className="object-cover object-center"
            src={bottomLogo}
            alt="another-logo"
          />
        </div>
      </div>
    </Card>
  );
}

export default Signup;
export const loginSignup = (page) => page;
Signup.getLayout = loginSignup;
