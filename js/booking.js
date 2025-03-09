document.addEventListener('DOMContentLoaded', function() {
    // Booking system state
    const bookingState = {
        currentStep: 1,
        selectedService: null,
        selectedServiceName: '',
        selectedPrice: 0,
        selectedDuration: 0,
        selectedStylist: null,
        selectedStylistName: '',
        selectedDate: null,
        selectedTime: null,
        customerDetails: {
            name: '',
            email: '',
            phone: '',
            notes: ''
        }
    };
    
    // DOM elements
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.booking-step-content');
    const prevButton = document.getElementById('prev-step');
    const nextButton = document.getElementById('next-step');
    const confirmButton = document.getElementById('confirm-booking');
    
    // Initialize the booking system
    function initBookingSystem() {
        // Service selection
        const categoryButtons = document.querySelectorAll('.category-btn');
        const serviceOptions = document.querySelectorAll('.service-option');
        const serviceButtons = document.querySelectorAll('.select-service');
        
        // Filter services by category
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active state
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.getAttribute('data-category');
                
                // Show/hide services based on category
                serviceOptions.forEach(service => {
                    if (category === 'all' || service.getAttribute('data-category') === category) {
                        service.style.display = 'flex';
                    } else {
                        service.style.display = 'none';
                    }
                });
            });
        });
        
        // Service selection
        serviceButtons.forEach(button => {
            button.addEventListener('click', function() {
                const serviceId = this.getAttribute('data-service');
                const serviceName = this.closest('.service-option').querySelector('h3').textContent;
                const servicePrice = parseInt(this.getAttribute('data-price'));
                const serviceDuration = parseInt(this.getAttribute('data-duration'));
                
                // Update booking state
                bookingState.selectedService = serviceId;
                bookingState.selectedServiceName = serviceName;
                bookingState.selectedPrice = servicePrice;
                bookingState.selectedDuration = serviceDuration;
                
                // Move to next step
                nextStep();
            });
        });
        
        // Stylist selection
        const stylistButtons = document.querySelectorAll('.select-stylist');
        
        stylistButtons.forEach(button => {
            button.addEventListener('click', function() {
                const stylistId = this.getAttribute('data-stylist');
                const stylistName = this.closest('.stylist-option').querySelector('h3').textContent;
                
                // Update booking state
                bookingState.selectedStylist = stylistId;
                bookingState.selectedStylistName = stylistName;
                
                // Move to next step
                nextStep();
            });
        });
        
        // Initialize calendar
        initCalendar();
        
        // Navigation buttons
        prevButton.addEventListener('click', prevStep);
        nextButton.addEventListener('click', function() {
            // Validate current step before proceeding
            if (validateCurrentStep()) {
                nextStep();
            }
        });
        
        confirmButton.addEventListener('click', submitBooking);
    }
    
    // Step navigation
    function nextStep() {
        if (bookingState.currentStep < 5) {
            bookingState.currentStep++;
            updateStepDisplay();
            
            // If we're on the final step, update the summary
            if (bookingState.currentStep === 5) {
                updateBookingSummary();
            }
        }
    }
    
    function prevStep() {
        if (bookingState.currentStep > 1) {
            bookingState.currentStep--;
            updateStepDisplay();
        }
    }
    
    // Update the display based on current step
    function updateStepDisplay() {
        // Update step indicators
        steps.forEach((step, index) => {
            const stepNum = index + 1;
            if (stepNum === bookingState.currentStep) {
                step.classList.add('active');
            } else if (stepNum < bookingState.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Show current step content
        stepContents.forEach((content, index) => {
            const stepNum = index + 1;
            if (stepNum === bookingState.currentStep) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
        
        // Update navigation buttons
        if (bookingState.currentStep > 1) {
            prevButton.style.display = 'block';
        } else {
            prevButton.style.display = 'none';
        }
        
        if (bookingState.currentStep === 4) {
            nextButton.style.display = 'block';
            confirmButton.style.display = 'none';
        } else if (bookingState.currentStep === 5) {
            nextButton.style.display = 'none';
            confirmButton.style.display = 'block';
        } else {
            nextButton.style.display = 'block';
            confirmButton.style.display = 'none';
        }
    }
    
    // Initialize calendar
    function initCalendar() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        renderCalendar(currentMonth, currentYear);
        
        // Previous month button
        document.querySelector('.prev-month').addEventListener('click', function() {
            const currentMonthText = document.getElementById('current-month').textContent;
            const [month, year] = currentMonthText.split(' ');
            
            const monthIndex = new Date(Date.parse(`${month} 1, ${year}`)).getMonth();
            const yearNum = parseInt(year);
            
            let newMonth = monthIndex - 1;
            let newYear = yearNum;
            
            if (newMonth < 0) {
                newMonth = 11;
                newYear--;
            }
            
            renderCalendar(newMonth, newYear);
        });
        
        // Next month button
        document.querySelector('.next-month').addEventListener('click', function() {
            const currentMonthText = document.getElementById('current-month').textContent;
            const [month, year] = currentMonthText.split(' ');
            
            const monthIndex = new Date(Date.parse(`${month} 1, ${year}`)).getMonth();
            const yearNum = parseInt(year);
            
            let newMonth = monthIndex + 1;
            let newYear = yearNum;
            
            if (newMonth > 11) {
                newMonth = 0;
                newYear++;
            }
            
            renderCalendar(newMonth, newYear);
        });
    }
    
    // Render calendar for a specific month and year
    function renderCalendar(month, year) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Adjust for Monday as first day of week
        const startDay = firstDay === 0 ? 6 : firstDay - 1;
        
        const calendarDays = document.getElementById('calendar-days');
        calendarDays.innerHTML = '';
        
        // Empty cells for days before the first day of the month
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            calendarDays.appendChild(emptyCell);
        }
        
        // Current date for comparison
        const today = new Date();
        
        // Cells for days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.textContent = i;
            
            const cellDate = new Date(year, month, i);
            
            // Disable past dates
            if (cellDate < today && !(cellDate.getDate() === today.getDate() && 
                                      cellDate.getMonth() === today.getMonth() && 
                                      cellDate.getFullYear() === today.getFullYear())) {
                dayCell.classList.add('disabled');
            } else {
                dayCell.addEventListener('click', function() {
                    // Remove active class from all days
                    document.querySelectorAll('.calendar-day').forEach(day => {
                        day.classList.remove('active');
                    });
                    
                    // Add active class to selected day
                    this.classList.add('active');
                    
                    // Update booking state
                    bookingState.selectedDate = new Date(year, month, i);
                    
                    // Generate time slots for selected date
                    generateTimeSlots(bookingState.selectedDate);
                });
            }
            
            calendarDays.appendChild(dayCell);
        }
    }
    
    // Generate time slots for a specific date
    function generateTimeSlots(date) {
        const timeSlotsContainer = document.getElementById('time-slots-container');
        timeSlotsContainer.innerHTML = '';
        
        const isToday = date.getDate() === new Date().getDate() && 
                        date.getMonth() === new Date().getMonth() && 
                        date.getFullYear() === new Date().getFullYear();
        
        const currentHour = new Date().getHours();
        
        // Opening and closing hours (24h format)
        const openingHour = 10; // 10:00 AM
        const closingHour = date.getDay() === 6 ? 17 : 19; // 5:00 PM on Saturdays, 7:00 PM other days
        
        // Sunday is closed
        if (date.getDay() === 0) {
            timeSlotsContainer.innerHTML = '<p>Sorry, we are closed on Sundays.</p>';
            return;
        }
        
        // Generate slots every 30 minutes
        for (let hour = openingHour; hour < closingHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                // Skip slots in the past if today
                if (isToday && (hour < currentHour || (hour === currentHour && minute <= new Date().getMinutes()))) {
                    continue;
                }
                
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                timeSlot.textContent = timeString;
                
                timeSlot.addEventListener('click', function() {
                    // Remove active class from all time slots
                    document.querySelectorAll('.time-slot').forEach(slot => {
                        slot.classList.remove('active');
                    });
                    
                    // Add active class to selected time slot
                    this.classList.add('active');
                    
                    // Update booking state
                    bookingState.selectedTime = timeString;
                    
                    // Enable the Next button
                    nextButton.disabled = false;
                });
                
                timeSlotsContainer.appendChild(timeSlot);
            }
        }
    }
    
    // Validate current step
    function validateCurrentStep() {
        switch (bookingState.currentStep) {
            case 1:
                return bookingState.selectedService !== null;
            case 2:
                return bookingState.selectedStylist !== null;
            case 3:
                return bookingState.selectedDate !== null && bookingState.selectedTime !== null;
            case 4:
                // Get form values
                const form = document.getElementById('booking-form');
                const name = form.name.value.trim();
                const email = form.email.value.trim();
                const phone = form.phone.value.trim();
                const notes = form.notes.value.trim();
                
                // Validate required fields
                if (!name || !email || !phone) {
                    alert('Please fill in all required fields');
                    return false;
                }
                
                // Validate email format
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(email)) {
                    alert('Please enter a valid email address');
                    return false;
                }
                
                // Update booking state
                bookingState.customerDetails.name = name;
                bookingState.customerDetails.email = email;
                bookingState.customerDetails.phone = phone;
                bookingState.customerDetails.notes = notes;
                
                return true;
            default:
                return true;
        }
    }
    
    // Update booking summary
    function updateBookingSummary() {
        document.getElementById('summary-service').textContent = bookingState.selectedServiceName;
        document.getElementById('summary-stylist').textContent = bookingState.selectedStylistName;
        
        if (bookingState.selectedDate) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('summary-date').textContent = bookingState.selectedDate.toLocaleDateString(undefined, options);
        }
        
        document.getElementById('summary-time').textContent = bookingState.selectedTime || '';
        document.getElementById('summary-duration').textContent = `${bookingState.selectedDuration} min`;
        document.getElementById('summary-price').textContent = `${bookingState.selectedPrice} kr`;
    }
    
    // Submit booking
    function submitBooking() {
        // In a real implementation, this would send the booking data to a server
        console.log('Booking submitted:', bookingState);
        
        // Show success message
        confirmButton.textContent = 'Booking Confirmed!';
        confirmButton.disabled = true;
        
        // Simulate email confirmation
        setTimeout(() => {
            alert(`Thank you, ${bookingState.customerDetails.name}! Your booking has been confirmed. A confirmation email has been sent to ${bookingState.customerDetails.email}.`);
        }, 1000);
    }
    
    // Initialize the booking system
    initBookingSystem();
});
