const SearchPro= {
  template: `
    <div>
      <label for="searchType">Search Services :</label>
      <input type="text" id="searchInput" placeholder="Enter search...">
      <button @click="performSearch">Search</button>
      <div v-if="servicerequest.length">
        <h3>Search Results:</h3>
        <table border="1" cellpadding="10">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Customer Id</th>
              <th>Customer Name</th>
              <th>Customer Location</th>
              <th>Customer Mobile No</th>
              <th>Professional Id</th>
              <th>Date of creation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="servicereq in servicerequest" :key="servicereq.service_name">
              <td>{{ servicereq.service_name }}</td>
              <td>{{ servicereq.customer_id }}</td>
              <td>{{ servicereq.customer.name }}</td>
              <td>{{ servicereq.customer.location }}</td>
              <td>{{ servicereq.customer.mobile_no }}</td>
              <td>{{ servicereq.professional_id }}</td>
              <td>{{ servicereq.date_of_request }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="searchPerformed && !servicerequest.length">
        <p>No services found.</p>
      </div>
    </div>
  `,
  data() {
    return {
      servicerequest: [],
      searchPerformed: false
    };
  },
  async mounted() {
    // Initial fetch with no search term
    try {
      const response = await fetch('/api/servicerequest');
      if (response.ok) {
        this.servicerequest = await response.json();
      } else {
        console.error('Failed to fetch services');
      }
    } catch (error) {
      console.error('Error during initial fetch:', error);
    }
  },
  methods: {
    async performSearch() {
      const searchInput = document.getElementById('searchInput').value.trim();
      try {
        const response = await fetch(`/api/servicerequest?name=${encodeURIComponent(searchInput)}`);
        if (response.ok) {
          this.servicerequest = await response.json();
        } else {
          console.error('Failed to perform search');
          this.servicerequest = [];
        }
      } catch (error) {
        console.error('Error during search:', error);
        this.servicerequest = [];
      }
      this.searchPerformed = true;
    }
  }
};

export default SearchPro;