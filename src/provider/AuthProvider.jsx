import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import auth from "../firebase/firebase.config";
import useAxiosPublic from "../hook/useAxiosPublic";

export const AuthContext = createContext();
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
  const axiosPublic = useAxiosPublic();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleRegister = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const handleLogin = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };

  // Update user profile
  const manageProfile = async (name, image) => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: image,
        });

        setUser((prevUser) => ({
          ...prevUser,
          displayName: name,
          photoURL: image,
        }));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // const manageProfile = (name, image) => {
  //   setLoading(true);
  //   return updateProfile(auth.currentUser, {
  //     displayName: name,
  //     photoURL: image,
  //   });
  // };

  // forgot password
  const forgotPassword = (email) => {
    setLoading(true);
    return sendPasswordResetEmail(auth, email);
  };

  const handleLogout = () => {
    setLoading(true);
    return signOut(auth);
  };

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
  //     setUser(currentUser);
  //     console.log("state captured", currentUser?.email);

  //     if (currentUser?.email) {
  //       const user = { email: currentUser.email };

  //       try {
  //         const response = await axios.post("http://localhost:5000/jwt", user, {
  //           withCredentials: true,
  //         });
  //         console.log("login token", response.data);
  //       } catch (error) {
  //         console.error("Error fetching login token:", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     } else {
  //       try {
  //         const response = await axios.post(
  //           "http://localhost:5000/logout",
  //           {},
  //           { withCredentials: true }
  //         );
  //         console.log("logout", response.data);
  //       } catch (error) {
  //         console.error("Error during logout:", error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     }
  //   });

  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  // useEffect(() => {
  //   const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
  //     setUser(currentUser);
  //     setLoading(false);
  //   });

  //   return () => {
  //     return unSubscribe();
  //   };
  // }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // get token and store client
        const userInfo = { email: currentUser.email };
        axiosPublic.post("/jwt", userInfo).then((res) => {
          if (res.data.token) {
            localStorage.setItem("access-token", res.data.token);
          }
        });
      } else {
        // TODO: remove token (if token stored in the client side: Local storage, caching, in memory)
        localStorage.removeItem("access-token");
      }
      setLoading(false);
    });
    return () => {
      return unsubscribe();
    };
  }, [axiosPublic]);

  const info = {
    handleRegister,
    handleLogin,
    handleGoogleLogin,
    manageProfile,
    handleLogout,
    user,
    loading,
    setUser,
    forgotPassword,
  };

  return <AuthContext.Provider value={info}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
