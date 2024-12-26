const ProfileCus = {
  template: `
    <div class="container mt-5">
      <h2>Profile Details</h2>
      <div v-if="loading" class="text-center mt-5">
        <p>Loading profile data...</p>
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div v-else>
        <table class="table">
          <tr>
            <th>Email</th>
            <td>{{ customer.email }}</td>
          </tr>
          <tr>
            <th>Name</th>
            <td>{{ customer.name }}</td>
          </tr>
          <tr>
            <th>Location</th>
            <td>
              <span v-if="!isEditing">{{ customer.location }}</span>
              <input v-if="isEditing" v-model="tempcustomer.location" type="text" class="form-control" required />
            </td>
          </tr>
          <tr>
            <th>Mobile Number</th>
            <td>
              <span v-if="!isEditing">{{ customer.mobile_no }}</span>
              <input v-if="isEditing" v-model="tempcustomer.mobile_no" type="text" class="form-control" required />
            </td>
          </tr>
        </table>
        
        <div class="mt-3">
          <button v-if="!isEditing" @click="editProfile" class="btn btn-primary">Edit Profile</button>
          <button v-if="isEditing" @click="saveProfile" class="btn btn-success">Save Changes</button>
          <button v-if="isEditing" @click="cancelEdit" class="btn btn-secondary">Cancel</button>
        </div>

        <p v-if="successMessage" class="text-success mt-3">{{ successMessage }}</p>
        <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>
      </div>
    </div>
  `,
  
  data() {
    return {
      customer: {
        email: "",
        name: "",
        location: "",
        mobile_no: ""
      },
      tempcustomer: {},
      loading: true,
      isEditing: false,
      successMessage: "",
      errorMessage: ""
    };
  },
  
  methods: {
    async fetchcustomer() {
      try {
        const res = await fetch("/profile_cus", {
          method: "GET",
          credentials: "same-origin",
        });
        
        if (res.ok) {
          const data = await res.json();
          this.customer = data;
          this.tempcustomer = { ...data };
          this.errorMessage = "";
        } else {
          this.errorMessage = "Failed to load profile data.";
        }
      } catch (error) {
        this.errorMessage = "An error occurred while loading profile data.";
      } finally {
        this.loading = false;
      }
    },
    
    editProfile() {
      this.isEditing = true;
      this.tempcustomer = { ...this.customer };
    },

    cancelEdit() {
      this.isEditing = false;
      this.customer = { ...this.tempcustomer };
    },

    async saveProfile() {
      this.loading = true;
      try {
        const res = await fetch("/profile_cus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.tempcustomer),
          credentials: "same-origin"
        });
        
        if (res.ok) {
          this.customer = { ...this.tempcustomer };
          this.successMessage = "Profile updated successfully!";
          this.errorMessage = "";
          this.isEditing = false;
        } else {
          const errorData = await res.json();
          this.errorMessage = errorData.message || "Failed to update profile.";
          this.successMessage = "";
        }
      } catch (error) {
        this.errorMessage = "An error occurred while updating profile.";
        this.successMessage = "";
      } finally {
        this.loading = false;
      }
    }
  },
  
  async mounted() {
    await this.fetchcustomer();
  }
};

export default ProfileCus;
