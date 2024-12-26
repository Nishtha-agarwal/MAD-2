const Add_Service = {
    template: `
        <div>
            <h2>New Service</h2>
            <br>
            <form @submit.prevent="submitForm">
            <div>
                <label for="name">Name:</label>
                <input type="text" id="name" v-model="newService.name" required />
            </div>
  
            <div>
                <label for="price">Price:</label>
                <input type="number" id="price" v-model="newService.price" required />
            </div>
  
            <div>
                <label for="time_required">Time Required (in minutes):</label>
                <input type="number" id="time_required" v-model="newService.time_required" required />
            </div>
  
            <div>
                <label for="description">Description:</label>
                <textarea id="description" v-model="newService.description" required></textarea>
            </div>
  
            <div>
                <button type="submit">Add Service</button>
            </div>
            </form>
        </div>
    `,

    data() {
      return {
        newService: {
          name: '',
          price: '',
          time_required: '',
          description: '',
        },
      };
    },
    methods: {
      async submitForm() {
        const serviceData = {
          name: this.newService.name,
          price: this.newService.price,
          time_required: this.newService.time_required,
          description: this.newService.description
        };
  
        try {
          const response = await fetch(window.location.origin + "/add_services", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(serviceData),
          });
  
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              this.successMessage = "Service added successfully!";
              this.newService = { name: '', price: '', time_required: '', description: '' };
              
              this.$router.push(result.redirect_url);;
            } else {
              this.errorMessage = result.message || "Failed to add service. Please try again.";
            }
          } else {
            this.errorMessage = "Failed to connect to the server. Please try again later.";
          }
        } catch (error) {
          console.error("Error adding service:", error);
          this.errorMessage = "An error occurred. Please try again.";
        }
      },
    },
  };

export default Add_Service;