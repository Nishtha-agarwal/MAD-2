const ServiceBooking = {
    template :`
        <div>
        <h2>Book Service</h2>
        <p>Service Name: {{ form.service_name }}</p>

        <form @submit.prevent="submitServiceRequest">
            <div>
                <label for="customerId">Customer ID:</label>
                <input type="number" v-model="form.customer_id" required />
            </div>
            <div>
                <label for="professionalId">Professional ID:</label>
                <input type="number" v-model="form.professional_id" required />
            </div>
            <div>
                <label for="remarks">Discription:</label>
                <textarea v-model="form.remarks"></textarea>
            </div>
            <div>
                <label for="status">Status:</label>
                <input type="text" v-model="form.service_status" required />
            </div>
            <button type="submit">Submit</button>
        </form>
    </div>
    `,

  data() {
    return {
      form: {
        service_name: this.$route.params.serviceName,
        customer_id: null,
        professional_id: null,
        service_status: "Pending",
        remarks: "",
      },
    };
  },

  mounted() {
    console.log("Route params:", this.$route.params);
    console.log("Service ID from route params:", this.$route.params.serviceName);
    if (this.$route.params.serviceName) {
      this.form.service_id = this.$route.params.serviceName;
    }
  },

  methods: {
    async submitServiceRequest() {
      try {
        const response = await fetch('/api/request_service', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.form),
        });

        if (response.ok) {
          alert("Service request created successfully!");
          this.$router.push('/cus_dash');
        } else {
          console.error("Failed to create service request.");
        }
      } catch (error) {
        console.error("Error submitting service request:", error);
      }
    },
  },
};

export default ServiceBooking;