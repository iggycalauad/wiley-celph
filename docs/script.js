		//Global declarations
		let currentPage = 1;
        const recordsPerPage = 100;
        let totalRecords = 0;
        let tableData = []; // This will be populated with your Excel data
        let originalTableData = [];
		
		// Function to load the JSON data
		async function loadJSONData() {
        try {
            const response = await fetch('data.json'); // Path to your JSON file
            const data = await response.json();
            tableData = data;
            originalTableData = [...data];
            totalRecords = tableData.length;
            loadTableData();
			populateFilters();
			} catch (error) {
            console.error("Error loading JSON data:", error);
							}
		}
		
		//loading the data to the HTML table
        function loadTableData() {
            const table = document.getElementById("urlTable");
            const tbody = table.getElementsByTagName("tbody")[0];
            tbody.innerHTML = ""; // Clear existing rows

            const start = (currentPage - 1) * recordsPerPage;
            const end = Math.min(start + recordsPerPage, totalRecords);

            for (let i = start; i < end; i++) {
                const row = document.createElement("tr");

                const cell1 = document.createElement("td");
                cell1.textContent = tableData[i][0]; // Subject

                const cell2 = document.createElement("td");
                cell2.textContent = tableData[i][1]; // Tranch
				
				const cell3 = document.createElement("td");
                cell3.textContent = tableData[i][5]; // Publication

                const cell4 = document.createElement("td");
                const link = document.createElement("a");
                link.href = tableData[i][3]; // URL
                link.target = "_blank";
                link.textContent = tableData[i][2]; // Title
                cell4.appendChild(link);
				
				const cell5 = document.createElement("td");
                cell5.textContent = tableData[i][4]; // Contributing Library

                row.appendChild(cell1);
                row.appendChild(cell2);
                row.appendChild(cell3);
                row.appendChild(cell4);
				row.appendChild(cell5);
                tbody.appendChild(row);
            }
			
			// Hide the loading message once the data is loaded
			document.getElementById("loadingMessage").style.display = "none";

            updatePagination();
        }

		//every loading, update the footer pagination
		function updatePagination() 
		{
			const pagination = document.getElementById("pagination");
			const paginationControls = pagination.getElementsByClassName("pagination-controls")[0];
			const paginationInfo = document.getElementById("paginationInfo");
    
			paginationControls.innerHTML = "";
			paginationInfo.innerHTML = "";

			const totalPages = Math.ceil(totalRecords / recordsPerPage);
    
			for (let i = 1; i <= totalPages; i++) 
			{
				const button = document.createElement("button");
				button.textContent = i;
				button.className = i === currentPage ? "active" : "";
				button.onclick = function() 
								{
									currentPage = i;
									loadTableData();
								};
				paginationControls.appendChild(button);
			}

				paginationInfo.innerHTML = `Page ${currentPage} of ${totalPages} | Total Records Count: ${totalRecords}`;
		}
		
		//everytime the page loads, the filter values will be populated
		function populateFilters() {
			const dropdowns = [
				document.getElementById("filter0"),
				document.getElementById("filter1"),
				document.getElementById("filter2"),
				document.getElementById("filter3"),
				document.getElementById("filter4")
							];

			// Clear existing options
			dropdowns.forEach(dropdown => {
			dropdown.innerHTML = '<option value="">All</option>';
			});

			const uniqueValues = [{}, {}, {}, {}, {}]; // Store unique values for each dropdown (skip index 3)

			// Collect unique values from the entire tableData (not just visible rows)
			tableData.forEach(row => {
			row.forEach((value, index) => {
            let dropdownIndex;
            if (index === 0) dropdownIndex = 0; // Subject -> dropdown 0
            else if (index === 1) dropdownIndex = 1; // Tranche -> dropdown 1
            else if (index === 2) dropdownIndex = 2; // Title -> dropdown 2
            else if (index === 4) dropdownIndex = 3; // Contributing Library -> dropdown 3
            else if (index === 5) dropdownIndex = 4; // Publication Year -> dropdown 4
            else return; // Skip other indices (like index 3)

            if (dropdownIndex < dropdowns.length && value) {
                const lowercaseValue = value.toLowerCase();
                uniqueValues[dropdownIndex][lowercaseValue] = value;
            }
        });
    });

			// Build the options for each dropdown
			uniqueValues.forEach((values, i) => {
			const options = Object.values(values).map(value => `<option value="${value.toLowerCase()}">${value}</option>`).join('');
			dropdowns[i].innerHTML += options; // Update the DOM once per dropdown
			});
	}

	//It will filter the records and show results
	function filterTable() {
    // Reset the table data to the original data before filtering
    tableData = [...originalTableData];

    // Get the current filter values from all columns
    const filters = [];
    for (let col = 0; col < 5; col++) { // Adjust the number 5 based on the number of columns with filters
        const filterInput = document.getElementById("filter" + col);
        filters[col] = filterInput ? filterInput.value.toLowerCase() : "";
    }

    // Filter the tableData based on all the filter values
    const filteredData = tableData.filter(row => {
        return filters.every((filter, col) => {
            // If "All" is selected (empty filter), don't filter by this column
            if (filter === "") return true;

            // Match specific columns to other indices if necessary
            if (col === 3) {
                const cellValue = row[4] ? row[4].toString().toLowerCase() : ""; // Match col 3 to index 4
                return cellValue.indexOf(filter) > -1;
            } else if (col === 4) {
                const cellValue = row[5] ? row[5].toString().toLowerCase() : ""; // Match col 4 to index 5
                return cellValue.indexOf(filter) > -1;
            } else {
                const cellValue = row[col].toString().toLowerCase();
                return cellValue.indexOf(filter) > -1;
            }
        });
    });

    // Update the totalRecords count and reload the table with the filtered data
    totalRecords = filteredData.length;
    tableData = filteredData;
    currentPage = 1; // Reset to the first page after filtering
    loadTableData();
}
		//sort the records regardless if filtered or not
        function sortTable(column) {
            const sortButton = document.getElementById("sort" + column);
            const sortDirection = sortButton.dataset.sortDirection;
            const newDirection = sortDirection === "asc" ? "desc" : "asc";
            sortButton.dataset.sortDirection = newDirection;
            sortButton.classList.toggle("sort-desc", newDirection === "desc");

            tableData.sort((a, b) => {
                if (newDirection === "asc") {
                    return a[column] > b[column] ? 1 : -1;
                } else {
                    return a[column] < b[column] ? 1 : -1;
                }
            });

            loadTableData();
        }
		
		//function to search specific titles
		function searchTable() {
         const searchTerm = document.getElementById("searchInput").value.toLowerCase();
           tableData = originalTableData.filter(row =>
             row[2].toString().toLowerCase().includes(searchTerm) // Filter only Title column
            );
            totalRecords = tableData.length;
            currentPage = 1;
            loadTableData();
			populateFilters();
			updatePagination();
        }
		
		//Upon loading the page, it will call the function to load the data
		window.onload = function() {
		loadJSONData();
        };