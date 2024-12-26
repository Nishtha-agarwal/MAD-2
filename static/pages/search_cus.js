const SearchCus = {
  template: `
    <div>
      <label for="searchType">Search Services :</label>
      <input type="text" id="searchInput" placeholder="Enter search...">
      <button @click="performSearch">Search</button>

      <div v-if="services.length">
        <h3>Search Results:</h3>
        <table border="1" cellpadding="10">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Time Required (mins)</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in services" :key="service.id">
              <td>{{ service.name }}</td>
              <td>{{ service.price }}</td>
              <td>{{ service.time_required }}</td>
              <td>{{ service.description }}</td>
              <th>
                <router-link :to="{ name:'ServiceBooking', params: { serviceName: service.name } }">
                <button>Book</button></router-link>
              </th>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="searchPerformed && !services.length">
        <p>No services found.</p>
      </div>
    </div>
  `,

  data() {
    return {
      services: [],
      searchPerformed: false
    };
  },

  async mounted() {
    // Fetch services from the API
    const response = await fetch('/api/services');
    const data = await response.json();
    this.services = data;
  },

  methods: {
    async performSearch() {
      const searchInput = document.getElementById('searchInput').value;
      try {
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: searchInput }),
        });
        if (response.ok) {
          const data = await response.json();
          this.services = data; // Assuming 'data' is an array of service objects
        } else {
          console.error("Failed to fetch services.");
          this.services = [];
        }
      } catch (error) {
        console.error("Error during search:", error);
        this.services = [];
      }
      this.searchPerformed = true;
    }
  }
};

export default SearchCus;

