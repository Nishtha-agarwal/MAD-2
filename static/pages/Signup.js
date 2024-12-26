import router from "../utils/router.js";

const Signup = {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="card shadow p-4">
        <h3 class="card-title text-center mb-4">Sign Up</h3>
        <div class="form-group mb-3">
            <input v-model="name" type="text" class="form-control" placeholder="Name" required/>
        </div>
        <div class="form-group mb-3">
          <input v-model="email" type="email" class="form-control" placeholder="Email" required/>
        </div>
        <div class="form-group mb-4">
          <input v-model="password" type="password" class="form-control" placeholder="Password" required/>
        </div>
        <div class="form-group mb-4">
          <select v-model="role" class="form-control" required>
            <option disabled value="">Select Role</option>
            <option value="pro">Service Professional</option>
            <option value="cus">Customer</option>
          </select>
        </div>
        <div v-if="role === 'pro'">
          <div class="form-group mb-3">
            <input v-model="service_type" type="text" class="form-control" placeholder="Service Type (e.g., Plumber, Electrician)" required/>
          </div>
          <div class="form-group mb-3">
            <input v-model="experience" type="number" class="form-control" placeholder="Experience (in years)" required/>
          </div>
          <div class="form-group mb-3">
            <input v-model="location" type="text" class="form-control" placeholder="Location" required/>
          </div>
          <div class="form-group mb-4">
            <input v-model="mobile_no" type="text" class="form-control" placeholder="Mobile Number" required/>
          </div>
        </div>
        <div v-else-if="role === 'cus'">
          <div class="form-group mb-3">
            <input v-model="location" type="text" class="form-control" placeholder="Location" required/>
          </div>
          <div class="form-group mb-4">
            <input v-model="mobile_no" type="text" class="form-control" placeholder="Mobile Number" required/>
          </div>
        </div>
        <button class="btn btn-primary w-100" @click="submitInfo">Submit</button>
      </div>
    </div>
  `,
  data() {
    return {
      name: "",
      email: "",
      password: "",
      role: "", // Role of the user (professional/customer)
      service_type: "", // Professional only
      experience: "",   // Professional only
      location: "",     // Both Professional and Customer
      mobile_no: ""     // Both Professional and Customer
    };
  },
  methods: {
    async submitInfo() {
      if (!this.role) {
        alert("Please select a role.");
        return;
      }

      const url = '/register';  // Backend URL to handle the signup
      const data = {
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role,
        location: this.location,
        mobile_no: this.mobile_no
      };
      // Add additional fields for professionals
      if (this.role === 'pro') {
        data.service_type = this.service_type;
        data.experience = this.experience;
      }
      const res = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
        credentials: "same-origin",
      });

      if (res.ok) {
        const responseData = await res.json();
        console.log(responseData);
        router.push("/login");
        this.resetForm() ;
      } else {
        const errorData = await res.json();
        console.error("Sign up failed:", errorData);
      }
    },    
    resetForm(){
        this.name = "";
        this.email = "";
        this.password = "";
        this.role = "";
        this.service_type = "";
        this.experience = "";
        this.location = "";
        this.mobile_no = "";
      }
    },
  };

export default Signup;