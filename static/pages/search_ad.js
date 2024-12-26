const Search = {
  template: `
    <div>
      <label for="searchType">Search Services :</label>
      <input type="text" id="searchInput" placeholder="Enter search...">
      <button @click="performSearch">Search</button>
      <br>
      <div v-if="servicerequest.length">
        <h3>Search Results:</h3>
        <br>
        <table border="1" cellpadding="15">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Customer Id</th>
              <th>Professional Id</th>
              <th>Date of creation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="servicereq in servicerequest" :key="servicereq.service_name">
              <td>{{ servicereq.service_name}}</td>
              <td>{{ servicereq.customer_id }}</td>
              <td>{{ servicereq.professional_id }}</td>
              <td>{{ servicereq.date_of_request }}</td>
              <td>{{ servicereq.service_status }}</td>
            </tr>
          </tbody>
        </table>
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
      const response = await fetch('/api/serviceadrequest');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched data:', data);
        this.servicerequest = data;
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
        const response = await fetch(`/api/serviceadrequest?name=${encodeURIComponent(searchInput)}`);
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

export default Search;

