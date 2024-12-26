const pro_dash = {
  template: `
    <div>
      <h4>Pending Services</h4>
      <table border="1" cellpadding="15">
        <thead>
          <tr>
            <th>Id</th>
            <th>Service Name</th>
            <th>Customer Id</th>
            <th>Customer Name</th>
            <th>Mobile No.</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="servicer in pendingServices" :key="servicer.id">
            <td>{{ servicer.id }}</td>
            <td>{{ servicer.service_name }}</td>
            <td>{{ servicer.customer_id }}</td>
            <td>{{ servicer.customer.name }}</td>
            <td>{{ servicer.customer.mobile_no }}</td>
            <td>{{ servicer.customer.location }}</td>
            <td>
              <button id="accept-btn" @click="acceptAction(servicer.id, 'Accepted')">Accept</button>
              <button id="reject-btn" @click="rejectAction(servicer.id, 'Rejected')">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
      <br>
      <br>
      <h4>Closed Services</h4>
      <table border="1" cellpadding="15">
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Customer Id</th>
            <th>Mobile No.</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in closedServices" :key="service.service_name">
            <td>{{ service.service_name }}</td>
            <td>{{ service.customer_id }}</td>
            <td>{{ service.mobile_no }}</td>
            <td>{{ service.location }}</td>
            <td>{{ service.service_status }}</td> 
          </tr>
        </tbody>
      </table>
    </div>
  `,
  data() {
    return {
      pendingServices: [], // Data for pending and accepted services
      closedServices: [], 
    };
  },
  methods: {

    async fetchPendingServices() {
      try {
        const response = await fetch('/api/pendingservices');
        if (response.ok) {
          const data = await response.json();
          console.log('Pending Services:', data); // Debug
          this.pendingServices = data;
        } else {
          alert('Failed to fetch Services.');
        }
      } catch (error) {
        console.error('Error fetching Services:', error);
      }
    },

    // Fetch "Closed Services"
    async fetchClosedServices() {
      try {
        const response = await fetch('/api/closedservices');
        if (response.ok) {
          const data = await response.json();
          console.log('Closed Services:', data); // Debug
          this.closedServices = data;
        } else {
          alert('Failed to fetch Closed Services.');
        }
      } catch (error) {
        console.error('Error fetching Closed Services:', error);
      }
    },

    async acceptAction(id, service_status) {
      console.log('Service ID:', id); 
      try {
        const response = await fetch('/api/update_action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: id, service_status: service_status }),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Response:', data);
          this.pendingServices = this.pendingServices.filter(service => service.id !== id);
          alert(`Service ${service_status} successfully!`);
        } else {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          alert(`Failed to update service: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error updating service:', error);
        alert('An error occurred while updating the service.');
      }
    },
  
    // Optional: Reject Action (similar logic as acceptAction)
    async rejectAction(id, service_status) {
      console.log('Service ID:', id); 
      try {
        const response = await fetch('/api/update_action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: id, service_status: service_status }),
        });
  
        if (response.ok) {
          this.pendingServices = this.pendingServices.filter(service => service.id !== id);
          alert(`Service ${service_status} successfully!`);
        } else {
          const errorData = await response.json();
          alert(`Failed to update service: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error updating service:', error);
        alert('An error occurred while updating the service.');
      }
    },


  },

  mounted() {
    // Fetch data on component mount
    this.fetchPendingServices();
    this.fetchClosedServices();
  },
};

export default pro_dash;


