import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";
axios.defaults.withCredentials = true;

class AuthService {
  login(user) {
    return axios
      .post(API_URL + "signin", {
        username: user.username,
        password: user.password,
      })
      .then((response) => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  async oauth2() {
    return axios
      .get(API_URL + "oauth2/redirect", {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      .then((response) => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  test() {
    return axios
      .get(API_URL + "a", {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      .then((response) => {
        console.log(response.data)
        return response.data;
      });
  }


  async logout() {
    try {
      const response = await axios.post(API_URL + "signout");
      if (response.data.message) {
        console.log(response.data.message);
      }
      localStorage.removeItem("user");
      location.reload(true)
    } catch (error) {
      console.error("Logout failed：", error);
    }
  }

  register(user) {
    return axios.post(API_URL + "signup", {
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
    });
  }

  checkAuth() {
    return axios.get(API_URL + "checkAuth");
  }





  // oauth2() {
  //   return axios.get(API_URL+ "oauth2/redirect");
  // }
}

export default new AuthService();
