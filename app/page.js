"use client";

import Image from "next/image";

import React, { Component } from 'react';
import Slider from 'react-slick';
import { FaWifi, FaBed, FaBath, FaTv, FaUtensils, FaCheck } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import PropTypes from "prop-types";

import "react-datepicker/dist/react-datepicker.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

class DateRangeComponent extends React.Component {
  constructor(props) {
    super(props);
    const initialMonth = props.initialMonth
      ? new Date(props.initialMonth)
      : new Date();
    this.state = {
      currentMonth: new Date(
        initialMonth.getFullYear(),
        initialMonth.getMonth(),
        1
      ),
      selectedStartDate: null,
      selectedEndDate: null,
      hoverDate: null,
    };
  }

  handlePrevMonth = () => {
    this.setState((prevState) => {
      const prevMonth = new Date(
        prevState.currentMonth.getFullYear(),
        prevState.currentMonth.getMonth() - 1,
        1
      );
      return { currentMonth: prevMonth };
    });
  };

  handleNextMonth = () => {
    this.setState((prevState) => {
      const nextMonth = new Date(
        prevState.currentMonth.getFullYear(),
        prevState.currentMonth.getMonth() + 1,
        1
      );
      return { currentMonth: nextMonth };
    });
  };

  isUnavailable = (date) => {
    const { unavailableDates } = this.props;
    return unavailableDates.some(
      (unavDate) =>
        unavDate.getFullYear() === date.getFullYear() &&
        unavDate.getMonth() === date.getMonth() &&
        unavDate.getDate() === date.getDate()
    );
  };

  handleDateClick = (date) => {
    if (this.isUnavailable(date)) return;

    const { selectedStartDate, selectedEndDate } = this.state;

    if (
      selectedStartDate &&
      !selectedEndDate &&
      date >= selectedStartDate &&
      this.isRangeAvailable(selectedStartDate, date)
    ) {
      this.setState({ selectedEndDate: date });
    } else {
      this.setState({ selectedStartDate: date, selectedEndDate: null });
    }
  };

  isRangeAvailable = (start, end) => {
    const { unavailableDates } = this.props;
    for (
      let d = new Date(start);
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      if (
        unavailableDates.some(
          (unavDate) =>
            unavDate.getFullYear() === d.getFullYear() &&
            unavDate.getMonth() === d.getMonth() &&
            unavDate.getDate() === d.getDate()
        )
      ) {
        return false;
      }
    }
    return true;
  };

  isInRange = (date) => {
    const { selectedStartDate, selectedEndDate } = this.state;
    if (selectedStartDate && selectedEndDate) {
      return date >= selectedStartDate && date <= selectedEndDate;
    }
    return false;
  };

  renderHeader = (month) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return (
      <div style={styles.header}>
        <span style={styles.monthName}>
          {monthNames[month.getMonth()]} {month.getFullYear()}
        </span>
      </div>
    );
  };

  renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div style={styles.daysRow}>
        {days.map((day) => (
          <div key={day} style={styles.dayCell}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  getMonthDays = (month) => {
    const startDate = new Date(
      month.getFullYear(),
      month.getMonth(),
      1
    );
    const endDate = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    );
    const days = [];
    for (let d = 1; d <= endDate.getDate(); d++) {
      days.push(new Date(month.getFullYear(), month.getMonth(), d));
    }
    return days;
  };

  renderMonth = (month) => {
    const monthDays = this.getMonthDays(month);
    const weeks = [];
    let week = [];

    // Determine the first day of the week
    for (let i = 0; i < monthDays[0].getDay(); i++) {
      week.push(null);
    }

    monthDays.forEach((date) => {
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      week.push(new Date(date));
    });

    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);

    return (
      <div style={styles.monthContainer}>
        {this.renderHeader(month)}
        {this.renderDays()}
        {weeks.map((week, idx) => (
          <div key={idx} style={styles.weekRow}>
            {week.map((date, index) => {
              if (!date) {
                return <div key={index} style={styles.emptyCell}></div>;
              }
              const isUnavailable = this.isUnavailable(date);
              const isSelectedStart =
                this.state.selectedStartDate &&
                date.getTime() ===
                  this.state.selectedStartDate.getTime();
              const isSelectedEnd =
                this.state.selectedEndDate &&
                date.getTime() === this.state.selectedEndDate.getTime();
              const inRange = this.isInRange(date);
              return (
                <div
                  key={index}
                  style={{
                    ...styles.dateCell,
                    ...(isUnavailable
                      ? styles.unavailable
                      : {}),
                    ...(inRange
                      ? styles.inRange
                      : {}),
                    ...(isSelectedStart || isSelectedEnd
                      ? styles.selected
                      : {}),
                  }}
                  onClick={() => this.handleDateClick(date)}
                >
                  {isUnavailable ? (
                    <span style={styles.unavailableText}>
                      {date.getDate()}
                    </span>
                  ) : (
                    date.getDate()
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  render() {
    const { currentMonth, selectedStartDate, selectedEndDate } =
      this.state;
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );

    return (
      <div style={styles.container}>
        <div style={styles.controls}>
          <button onClick={this.handlePrevMonth} style={styles.navButton}>
            &lt;
          </button>
          <button onClick={this.handleNextMonth} style={styles.navButton}>
            &gt;
          </button>
        </div>
        <div style={styles.calendars}>
          {this.renderMonth(currentMonth)}
          {this.renderMonth(nextMonth)}
        </div>
        <div style={styles.selectionInfo}>
          <span>
            Start Date:{" "}
            {selectedStartDate
              ? selectedStartDate.toDateString()
              : "None"}
          </span>
          <span>
            End Date:{" "}
            {selectedEndDate
              ? selectedEndDate.toDateString()
              : "None"}
          </span>
        </div>
      </div>
    );
  }
}

DateRangeComponent.propTypes = {
  initialMonth: PropTypes.string, // e.g., "2025-01-01"
  unavailableDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
};

DateRangeComponent.defaultProps = {
  initialMonth: null,
  unavailableDates: [],
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    width: "700px",
    margin: "0 auto",
    userSelect: "none",
  },
  controls: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px",
  },
  navButton: {
    padding: "5px 10px",
    marginLeft: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  calendars: {
    display: "flex",
    justifyContent: "space-between",
  },
  monthContainer: {
    width: "48%",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "10px",
    fontWeight: "bold",
    fontSize: "18px",
  },
  monthName: {},
  daysRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
    fontWeight: "bold",
  },
  dayCell: {
    width: "14.28%",
    textAlign: "center",
  },
  weekRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
  },
  dateCell: {
    width: "14.28%",
    height: "30px",
    textAlign: "center",
    lineHeight: "30px",
    cursor: "pointer",
    borderRadius: "4px",
  },
  emptyCell: {
    width: "14.28%",
    height: "30px",
  },
  unavailable: {
    color: "grey",
    textDecoration: "line-through",
    cursor: "not-allowed",
  },
  unavailableText: {
    color: "grey",
    textDecoration: "line-through",
  },
  selected: {
    backgroundColor: "#4caf50",
    color: "white",
    borderRadius: "50%",
  },
  inRange: {
    backgroundColor: "#a5d6a7",
    color: "white",
  },
  selectionInfo: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "16px",
  },
};
	  
class BookingForm extends React.Component {

  constructor() {
	super();
    this.checkIn = null;
    this.setCheckIn = null;
    this.checkOut = null;
    this.setCheckOut = null;
    this.isButtonEnabled = this.checkIn && this.checkOut && this.checkOut > this.checkIn;
	
	this.carouselSettings = {
		dots: true,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1
	  };

	this.amenities = [
		{ icon: <FaUtensils />, label: 'Kitchen' },
		{ icon: <FaWifi />, label: 'Wi-Fi' },
		{ icon: <FaBed />, label: 'Workspace' },
		{ icon: <FaBath />, label: 'Bathroom' },
		{ icon: <FaTv />, label: 'Television' },
		{ icon: <FaCheck />, label: 'Cleaning Products' },
	  ];

	this.mapStyles = {
		height: "300px",
		width: "100%"
	  };

	this.defaultCenter = {
		lat: 40.7128,
		lng: -74.0060
	  };
  }
  
  handleCheckAvailability() {
    alert(`Checking availability from ${checkIn.toLocaleDateString()} to ${checkOut.toLocaleDateString()}`);
  };

  render() {
    return (
	  <div className="max-w-4xl mx-auto p-4 font-sans">
      <Slider {...carouselSettings}>
        <div>
          <img src="https://via.placeholder.com/800x400?text=Property+Photo+1" alt="Property Photo 1" className="w-full h-64 object-cover rounded"/>
        </div>
        <div>
          <img src="https://via.placeholder.com/800x400?text=Property+Photo+2" alt="Property Photo 2" className="w-full h-64 object-cover rounded"/>
        </div>
        <div>
          <img src="https://via.placeholder.com/800x400?text=Property+Photo+3" alt="Property Photo 3" className="w-full h-64 object-cover rounded"/>
        </div>
      </Slider>

      <h1 className="text-3xl font-bold mt-6">Cozy Beachside Cottage</h1>

      <p className="text-gray-600 mt-2">
        Sleeps 6 · 3 Bedrooms · 4 Beds · 2 Bathrooms
      </p>

      <div className="mt-4 text-gray-700">
        <p>
          Experience the perfect blend of comfort and nature at our Cozy Beachside Cottage. Located just steps away from the pristine shoreline, this charming property offers stunning ocean views, spacious living areas, and modern amenities to make your stay unforgettable. Whether you're seeking relaxation or adventure, our cottage is the ideal getaway for families and friends.
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {this.amenities.map((amenity, index) => (
            <div key={index} className="flex items-center">
              <span className="text-xl text-blue-500 mr-2">{amenity.icon}</span>
              <span className="text-gray-700">{amenity.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Location</h2>
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
          <GoogleMap
            mapContainerStyle={this.mapStyles}
            zoom={15}
            center={this.defaultCenter}
          >
            <Marker position={this.defaultCenter}/>
          </GoogleMap>
        </LoadScript>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Check Availability</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div>
            <label className="block text-gray-700">Check-in Date:</label>
            <DatePicker
              selected={this.checkIn}
              onChange={(date) => this.setCheckIn = date}
              selectsStart
              startDate={this.checkIn}
              endDate={this.checkOut}
              minDate={new Date()}
              placeholderText="Select check-in date"
              className="mt-1 p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Check-out Date:</label>
            <DatePicker
              selected={this.checkOut}
              onChange={(date) => this.setCheckOut = date}
              selectsEnd
              startDate={this.checkIn}
              endDate={this.checkOut}
              minDate={this.checkIn}
              placeholderText="Select check-out date"
              className="mt-1 p-2 border rounded"
            />
          </div>
          <button
            onClick={this.handleCheckAvailability}
            disabled={!this.isButtonEnabled}
            className={`mt-6 sm:mt-0 px-4 py-2 rounded text-white ${
              this.isButtonEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Check Availability
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Cancellation Policy</h2>
        <p className="text-gray-700">
          Free cancellation within 48 hours of booking. After that, a full refund is provided if canceled at least 7 days before check-in. No refunds for cancellations made within 7 days of check-in.
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">House Rules</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>No smoking inside the property.</li>
          <li>Pets are not allowed.</li>
          <li>Maximum occupancy is 6 guests.</li>
          <li>Quiet hours are from 10 PM to 7 AM.</li>
        </ul>
      </div>

      <div className="mt-6 mb-8">
        <h2 className="text-2xl font-semibold mb-2">Safety Details</h2>
        <p className="text-gray-700">
          The property is equipped with smoke detectors, carbon monoxide detectors, and a first aid kit. Emergency exits are clearly marked, and fire extinguishers are available on each floor.
        </p>
      </div>
    </div>
    )
  };
};

const carouselSettings = {
		dots: true,
		infinite: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1
	  }

const amenities = [
		{ icon: <FaUtensils />, label: 'Kitchen' },
		{ icon: <FaWifi />, label: 'Wi-Fi' },
		{ icon: <FaBed />, label: 'Workspace' },
		{ icon: <FaBath />, label: 'Bathroom' },
		{ icon: <FaTv />, label: 'Television' },
		{ icon: <FaCheck />, label: 'Cleaning Products' },
	  ];
	  
function Home() {
  return (
    <div className="flex flex-col max-w-4xl">
	
	  <div className="flex-grow p-4">
	  <Slider {...carouselSettings}>
		<div>
		  <img src="img/image1.jpg" alt="Property Photo 1" className="w-full h-64 object-cover rounded"/>
		</div>
		<div>
		  <img src="img/image2.jpg" alt="Property Photo 2" className="w-full h-64 object-cover rounded"/>
		</div>
	  </Slider>
	  </div>
	  
	  <div className="flex-grow p-4 mt-6">
	    <h2 className="text-2xl font-semibold mb-4">Property Name</h2>
        <p className="text-gray-600 mt-2">
          Sleeps 6 · 3 Bedrooms · 4 Beds · 2 Bathrooms
        </p>
        <p>
          Experience the perfect blend of comfort and nature at our Cozy Beachside Cottage. Located just steps away from the pristine shoreline, this charming property offers stunning ocean views, spacious living areas, and modern amenities to make your stay unforgettable. Whether you're seeking relaxation or adventure, our cottage is the ideal getaway for families and friends.
        </p>
      </div>

	  <div className="flex-grow p-4">
        <DateRangeComponent />
	  </div>

      <div className="flex-grow p-4 mt-6">
        <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center">
              <span className="text-xl text-blue-500 mr-2">{amenity.icon}</span>
              <span className="text-gray-700">{amenity.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-grow p-4 mt-6">
        <h2 className="text-2xl font-semibold mb-2">Cancellation Policy</h2>
        <p className="text-gray-700">
          Free cancellation within 48 hours of booking. After that, a full refund is provided if canceled at least 7 days before check-in. No refunds for cancellations made within 7 days of check-in.
        </p>
      </div>

      <div className="flex-grow p-4 mt-6">
        <h2 className="text-2xl font-semibold mb-2">House Rules</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>No smoking inside the property.</li>
          <li>Pets are not allowed.</li>
          <li>Maximum occupancy is 6 guests.</li>
          <li>Quiet hours are from 10 PM to 7 AM.</li>
        </ul>
      </div>

      <div className="flex-grow p-4 mt-6 mb-8">
        <h2 className="text-2xl font-semibold mb-2">Safety Details</h2>
        <p className="text-gray-700">
          The property is equipped with smoke detectors, carbon monoxide detectors, and a first aid kit. Emergency exits are clearly marked, and fire extinguishers are available on each floor.
        </p>
      </div>

	</div>

  );
}

export default Home;
