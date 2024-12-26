const cus_dash = {
  template: `
    <div>
      <div @click="goToServicePage('Cleaning')">Cleaning</div>
      <div @click="goToServicePage('Gardening')">Gardening</div>
      <div @click="goToServicePage('Plumbing')">Plumbing</div>
      <div @click="goToServicePage('Electrical Repairs')">Electrical Repairs</div>
      <div @click="goToServicePage('Painting')">Painting</div>
      <div @click="goToServicePage('Pest Control')">Pest Control</div>
      <div @click="goToServicePage('AC servicing')">AC servicing</div>
      <br>

      <div>
      <h4>Services</h4>
      <table border="1" cellpadding="10">
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Professional Name</th>
            <th>Mobile No.</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="servicereq in services" :key="servicereq.service_name">
            <td>{{ servicereq.service_name}}</td>
            <td>{{ servicereq.professional.name }}</td>
            <td>{{ servicereq.professional.mobile_no }}</td>
            <td>
              <button id="close-btn" @click="closeAction(servicereq.service_name, 'Completed')">Close</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>


    `,
  data() {
    return {
      services: [], 
      feedbackFormVisible: false,
      selectedService: null,
      rating: 0,
      remark: '',
      selectedServiceId: null,
    };
  },
  async mounted() {
    await this.fetchServices();
  },
  methods: {
    async fetchServices() {
      try {
        const response = await fetch("/api/servicerequestcus", {
          method: "GET",
          credentials: "same-origin",
        });
        if (response.ok) {
          this.services = await response.json();
        } else {
          console.error("Failed to fetch services:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },

    async closeAction(service_name, status) {
      console.log('Sending update:', {service_name:service_name, service_status:status});
      try {
        const response = await fetch(`/api/servicerequestcus`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ service_name:service_name, service_status:status}),
        });
  
        if (response.ok) {
          console.log(`Service ${service_name} updated successfully.`);
        } else {
          console.error("Failed to update service:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating service:", error);
      }
    },
   
    goToServicePage(serviceType) {
      this.$router.push({ name: "servicePage", query: { type: serviceType } });
    },
  },
};

export default cus_dash;