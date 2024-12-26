const Dashboard_admin = {
  template: `
    <div>
      <h2>Services</h2>
      <table border="5" cellpadding="15">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Time Required(mins)</th>
            <th>Description</th>
            <th>Action</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services">
            <td>{{ service.name }}</td>
            <td>{{ service.price }}</td>
            <td>{{ service.time_required }}</td>
            <td>{{ service.description }}</td>
            <td>
              <button @click="editService(service)">Edit</button>
              <button @click="deleteService(service.name)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>   

      <!-- Edit Modal -->
      <div v-if="showEditModal">
        <h2>Edit Service</h2>
        <form @submit.prevent="updateService">
          <div>
            <label for="name">Name:</label>
            <input type="text" id="name" v-model="currentService.name" required />
          </div>
          <div>
            <label for="price">Price:</label>
            <input type="number" id="price" v-model="currentService.price" required />
          </div>
          <div>
            <label for="time_required">Time Required:</label>
            <input type="number" id="time_required" v-model="currentService.time_required" required />
          </div>
          <div>
            <label for="description">Description:</label>
            <textarea id="description" v-model="currentService.description" required></textarea>
          </div>
          <button type="submit">Update</button>
          <button type="button" @click="closeEditModal">Cancel</button>
        </form>
      </div>

      <br>
      <router-link to="/add_service">   + Add New Service</router-link>
      <br>
      <br>

      <h4>Service Requests</h4>
      <table border="5" cellpadding="15">
        <thead>
          <tr>
            <th>Service ID</th>
            <th>Customer ID</th>
            <th>Professional ID</th>
            <th>Service Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sr in srs" :key="sr.service_id">
            <td>{{ sr.service_name }}</td>
            <td>{{ sr.customer_id }}</td>
            <td>{{ sr.professional_id}}</td>
            <td>{{ sr.service_status }}</td>
            <td>
              <button @click="deleteServicerequest(sr.service_name)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <br><br>
      <h2>Professionals</h2>
      <table border="5" cellpadding="15">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Service_type</th>
            <th>Experience</th>
            <th>Location</th>
            <th>Mobile_no</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pro in professionals">
            <td>{{ pro.name }}</td>
            <td>{{ pro.email}}</td>
            <td>{{ pro.service_type }}</td>
            <td>{{ pro.experience }}</td>
            <td>{{ pro.location }}</td>
            <td>{{ pro.mobile_no }}</td>
            <td>
              <div v-if="!pro.is_active">
                <button @click="approveProfessional(pro.name)">Approve</button>
              </div>
              <div v-else>
                True
              </div>
            </td>
          </tr>
        </tbody>
      </table> 

      <br>
      <br>
      <h2>Customers</h2>
      <table border="5" cellpadding="15">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Location</th>
            <th>Mobile_no</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cus in customers">
            <td>{{ cus.name }}</td>
            <td>{{ cus.email}}</td>
            <td>{{ cus.location }}</td>
            <td>{{ cus.mobile_no }}</td>
            <td>
              <div v-if="!cus.is_active">
                <button @click="approveCustomer(cus.name)">Approve</button>
              </div>
              <div v-else>
                True
              </div>
            </td>
          </tr>
        </tbody>
      </table> 
    </div>
  `,

  data() {
    return {
      services: [], 
      srs: [],
      showEditModal: false,
      currentService: {},
      professionals: [],
      customers: [],      
      errorMessage: "",
      error:null,
    };
  },
  async mounted() {
    await this.fetchServices();
    await this.fetchProfessionals();
    await this.fetchCustomers();
    await this.fetchServiceRequests();
  },

  methods: {
    async fetchServices() {
      try {
        const response = await fetch(`${window.location.origin}/ad_dash`, {
          method: 'POST',
          headers: {
            'AuthenticationToken': sessionStorage.getItem("token"),
          },
        });
        if (response.ok) {
          const data = await response.json();
          this.services = data.data;
          console.log("Services:", this.services);
        } else {
          console.error("Failed to fetch services data");
          this.errorMessage = "Failed to fetch services. Please try again.";
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },

    async deleteService(servicename) {
      try {
        const response = await fetch(`${window.location.origin}/delete_service/${servicename}`, {
          method: 'DELETE',
          headers: {
            'AuthenticationToken': sessionStorage.getItem("token"),
          },
        });
        if (response.ok) {
          console.log("Service deleted successfully.");
          await this.fetchServices(); // Refresh the services list
        } else {
          console.error("Failed to delete service.");
        }
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    },

    editService(service) {
      this.currentService = { ...service };
      this.showEditModal = true; 
    },
    
    async updateService() {
      try {
        const response = await fetch(`${window.location.origin}/edit_service/${this.currentService.name}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'AuthenticationToken': sessionStorage.getItem("token"),
          },
          body: JSON.stringify(this.currentService),
        });
        if (response.ok) {
          console.log("Service updated successfully.");
          this.showEditModal = false; // Close the modal
          await this.fetchServices(); // Refresh the services list
        } else {
          console.error("Failed to update service.");
        }
      } catch (error) {
        console.error("Error updating service:", error);
      }
    },
    
    closeEditModal() {
      this.showEditModal = false;
    },

    async fetchServiceRequests() {
      try {
        const response = await fetch('/ad_dash_service_request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        // If the response is successful, update the services array
        if (response.ok) {
          const data = await response.json();
          this.srs = data.data;
        } else {
          // Handle error if the response is not OK
          const errorData = await response.json();
          this.error = errorData.error || 'Failed to fetch service requests.';
        }
      } catch (error) {
        // Handle network or unexpected errors
        this.error = 'An error occurred while fetching data: ' + error.message;
      }
    },

    async deleteServicerequest(service_name) {
      try {
        const response = await fetch(`/delete_service_request/${service_name}`, {
          method: 'DELETE',
          headers: {
            'AuthenticationToken': sessionStorage.getItem("token"),
          },
        });
        if (response.ok) {
          console.log("Service deleted successfully.");
          await this.fetchServiceRequests(); // Refresh the services list
        } else {
          console.error("Failed to delete service.");
        }
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    },

    async fetchProfessionals() {
      try {
        const response = await fetch(`${window.location.origin}/ad_dash_professionals`, {
          method: 'POST',
          headers: {
            'AuthenticationToken': sessionStorage.getItem("token"),
          },
        });
        if (response.ok) {
          const data = await response.json();
          this.professionals = data.data;
          console.log("Professionals:", this.professionals);
        } else {
          console.error("Failed to fetch professionals data");
          this.errorMessage = "Failed to fetch professionals. Please try again.";
        }
      } catch (error) {
        console.error("Error fetching professionals:", error);
      }
    },

    async fetchCustomers() {
      try {
        const response = await fetch(`${window.location.origin}/ad_dash_customers`, {
          method: 'POST',
          headers: {
            'AuthenticationToken': sessionStorage.getItem("token"),
          },
        });
        if (response.ok) {
          const data = await response.json();
          this.customers = data.data;
          console.log("Customers:", this.customers);
        } else {
          console.error("Failed to fetch customers data");
          this.errorMessage = "Failed to fetch customers. Please try again.";
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    },

    async approveProfessional(proName) {
      try {
        const response = await fetch(`/admin/approve/professional/${proName}`, {
          method: 'POST',
          headers: {
            'AuthenticationToken': sessionStorage.getItem("token"),
          },
        });
        if (response.ok) {
          console.log(`Professional ${proName} approved successfully.`);
          // Refresh professionals list
          await this.fetchProfessionals();
        } else {
          console.error("Failed to approve professional.");
        }
      } catch (error) {
        console.error("Error approving professional:", error);
      }
    },

    async approveCustomer(cusName) {
      try {
        const response = await fetch(`/admin/approve/customer/${cusName}`, {
          method: 'POST',
          headers: {
            'AuthenticationToken': sessionStorage.getItem("token"),
          },
        });
        if (response.ok) {
          console.log(`Customer ${cusName} approved successfully.`);
          // Refresh professionals list
          await this.fetchCustomers();
        } else {
          console.error("Failed to approve customer.");
        }
      } catch (error) {
        console.error("Error approving customer:", error);
      }
    },
  },
};

export default Dashboard_admin;
