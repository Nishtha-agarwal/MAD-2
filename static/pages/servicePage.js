const servicePage={
    template : `
    <div>
        <h1>{{ serviceType }} services</h1>
        <table border="1" cellpadding="15">
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
                    <td>
                        <router-link :to="{ name:'ServiceBooking', params: { serviceName: service.name } }">
                        <button>Book</button></router-link>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `,
    data() {
      return {
        services: [],
        serviceType: '',
      };
    },
    methods: {
        fetchServices() {
        fetch(`/api/service_request?name=${this.serviceType}`)
            .then((response) => response.json())
            .then((data) => {
                this.services = data;
            })
            .catch((error) => {
                console.error("Error fetching services:", error);
            });
        },
        bookService(serviceId) {
            console.log(`Booking service with ID: ${serviceId}`);
            // Implement booking logic here
        },
    },

    watch: {
        '$route.query.type': {
            handler(newType) {
                this.serviceType = newType || 'unknown';
                this.fetchServices();
            },
            immediate: true,
        },
    },

    mounted() {
        this.serviceType = this.$route.query.type || 'unknown';
        this.fetchServices();
    },
};
      
export default servicePage;