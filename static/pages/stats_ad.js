const Statistics= {
  template: `
    <div>
      <h4>Count of Professionals and Customers</h4>
      <canvas id="countChart" width="100" height="25"></canvas>
      <br>
      <br>
      <h4>Service Request Counts by Status</h4>
      <canvas id="serviceRequestChart" width="100" height="25"></canvas>
      <br>
    </div>
  `,
  data() {
    return {
      professionalCount: 0,
      customerCount: 0,
      serviceRequestStatusCounts: null, 
    };
  },

  async mounted() {
    try {
      const response = await fetch('/api/counts');
      if (response.ok) {
        const data = await response.json();
        console.log("Data fetched successfully:", data);
        
        this.professionalCount = data.professional_count || 0;
        this.customerCount = data.customer_count || 0;
        this.serviceRequestStatusCounts = data.service_request_status_counts || {};
        
        this.renderChart();
      } else {
        console.error('Failed to fetch counts');
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  },

  methods: {
    renderChart() {
      const ctx1 = document.getElementById('countChart').getContext('2d');
      new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ['Professionals', 'Customers'],
          datasets: [
            {
              label: 'Users',
              data: [this.professionalCount, this.customerCount],
              backgroundColor: ['#42A5F5', '#66BB6A'],
              borderColor: ['#1E88E5', '#43A047'],
              borderWidth: 0.02,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        },
      });

      const ctx2 = document.getElementById('serviceRequestChart').getContext('2d');
      console.log('Canvas for serviceRequestChart found:', ctx2);
      const statusLabels = ['Pending', 'Accepted', 'Completed', 'Rejected'];
      const statusData = statusLabels.map(
        (status) => this.serviceRequestStatusCounts[status] || 0
      );

      new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: statusLabels,
          datasets: [
            {
              label: 'Service Requests',
              data: statusData,
              backgroundColor: ['#FFA726', '#66BB6A', '#29B6F6', 'red'],
              borderColor: ['#FB8C00', '#388E3C', '#0288D1'],
              borderWidth: 0.02,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        },
      });
    },
  },
};

export default Statistics;