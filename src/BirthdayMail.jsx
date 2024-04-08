//this is another branch

import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaGift } from "react-icons/fa";
import { format } from 'date-fns';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';

const BirthdayMail = () => {
  const [birthdayData, setBirthdayData] = useState([]);
  const [flag, setFlag] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [employee, setEmployee] = useState("");
  const [disableButtonState, setDisableButtonState] = useState(""); // Local state for button disable
  const [empInfo,setEmpInfo]=useState("");
  const [successMessage, setSuccessMessage] = useState('');

  const currentDate = new Date();
  const current_day = currentDate.getDate();
  const current_month = currentDate.getMonth() + 1;
  const current_year = currentDate.getFullYear();

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/birthday-wish/getall")
      .then((response) => {
        const formattedData = response.data.map((item) => ({
          ...item,
          dateOfBirth: format(new Date(item.dateOfBirth), 'dd-MM-yyyy'),
          disableButtonState: localStorage.getItem(`disableButtonState_${item.empId}`) === 'true',
        }));  
        
        setBirthdayData(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching employee details:", error);
      });
  }, []);



  useEffect(() => {
    localStorage.setItem("BAData", JSON.stringify(birthdayData));
  }, [birthdayData]);


  const data = birthdayData
    .filter((item) => {
      const [emp_day, emp_month] = item.dateOfBirth.split("-").map(Number);
      return (
        (emp_day >= current_day && emp_month === current_month) ||
        (emp_day === current_day + 1 && emp_month === current_month)
      );
    })
    .sort((a, b) => {
      const [dayA, monthA] = a.dateOfBirth.split("-").map(Number);
      const [dayB, monthB] = b.dateOfBirth.split("-").map(Number);
      return monthA !== monthB ? monthA - monthB : dayA - dayB;
    });

  const toggleFlag = (employee) => {
    setFlag(!flag);
    setSelectedEmployeeId(employee);
    setEmployee(employee.empId);
  };

  const handleButtonClick1 = () => {
    const messageContent = document.getElementById("messageInput").value;

    if (!messageContent) {
      alert("Please enter a message before sending.");
    } else {
      axios.get(`http://localhost:8080/api/birthday-wish/send_wish?empId=${selectedEmployeeId.empId}&message=${messageContent}`)
        .then((response) => {
          const { result, empId } = response.data;
          setDisableButtonState(result);
          setEmpInfo(empId);
          console.log('Result from server:', result);
          if (response.data) {
            console.log("Email sent successfully");

            //update the state to mark emp as wished
            setBirthdayData((prevData) => prevData.map((item) =>
              item.id === selectedEmployeeId.id ? { ...item, wished: true, disableButtonState: true } : item

            ));

            // Update the success message   state with the checkmark icon
            setSuccessMessage(
              <div className='flex items-center justify-center'>
                <IoMdCheckmarkCircleOutline className='text-green-600 mr-2' />
                Successfully sent email wishes to {selectedEmployeeId.empName}
              </div>
            );

            // Set a timer to clear the success message after 30 seconds
            setTimeout(() => {
              setSuccessMessage('');
            }, 5000);

            // Store in local storage only if the email is successfully sent
            localStorage.setItem(`disableButtonState_${selectedEmployeeId.empId}`, 'true');

            
          } else {
            console.error("Failed to send email");
            alert("Failed to send email. Please try again later.");
          }
        })
        .catch((error) => {
          console.error("Error sending email:", error);
          alert("Failed to send email. Check console for details.");
        })
        .finally(() => {
          setSelectedEmployeeId(null);
        });
    }
  };

  const handleButtonClick2 = () => {
    setFlag(false);
    setSelectedEmployeeId(null);
  };

  return (
    <div >
      <div className='bg-gray-200 h-screen w-full'>
        <div className='bg-white h-[220px] w-[500px] rounded-lg ml-8 mt-4 absolute overflow-y-auto'>
          <div className='ml-3 mt-4'>
            <div className="flex gap-2">
              <h1 className='text-lg font-semibold '>Celebrating Birthdays Today</h1>
              <FaGift className="text-red-600 mt-1" />
            </div>
            {successMessage && (
              <div className=' bg-white mt-4 -mb-2 text-center text-green-600 '>
                {successMessage}
              </div>
            )}

            {data.map((empbirthday) => (
              <div key={empbirthday.id} className='grid grid-cols-8 mt-3'>
                <div className='w-92 flex mt-7 col-span-4'>
                  <img
                    src={`data:image/octet-stream;base64,${empbirthday.imgName}`}
                    style={{ width: '58px', height: '45px' }}
                    className='rounded-full -mt-2'
                  />
      
                <div className='ml-4 mr-6 -mt-1 text-gray-500'>
                  <h2 className='text-[14px] font-bold mr-2 '>
                    {empbirthday.empName}-{empbirthday.empId}
                  </h2>
                  <p className='text-[14px]'>
                    {empbirthday.empDesignation}
                  </p>
                </div>
              </div>
              <div className='col-span-2 mt-[25px] text-[13.5px] text-green-600 ml-14'>
                {parseInt(empbirthday.dateOfBirth.split("-")[0]) === current_day &&
                  parseInt(empbirthday.dateOfBirth.split("-")[1]) === current_month ? (
                    <h1>Today</h1>
                  ) : (
                    ""
                  )}
              </div>
              <div className='col-span-2 mt-6 text-sm'>
                {parseInt(empbirthday.dateOfBirth.split("-").slice(0, 2)) === current_day &&
                  parseInt(empbirthday.dateOfBirth.split("-").slice(1, 2)) === current_month ? (
                    <div>
                      {flag &&
                        selectedEmployeeId && selectedEmployeeId.id === empbirthday.id ? (
                          <div className="mt-10 bg-white pt-6 -ml-[280px] flex gap-1 text-xs ">
                            <input
                              type="text"
                              placeholder="Happy Birthday!"
                              className="w-60 border border-gray-300"
                              id="messageInput"
                            />
                            <button
                              onClick={handleButtonClick1}
                              className="border border-blue-500 h-6 px-4 text-blue-500 bg-white ml-18"
                            >
                              Send
                            </button>
                            <button
                              onClick={handleButtonClick2}
                              className="border border-gray-500 h-6 px-4 text-gray-500 bg-white ml-18"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="col-span-1 text-sm ml-8">
                            <button
                              onClick={() => toggleFlag(empbirthday)}
                              className="border border-blue-500 h-7 w-[72px] text-blue-500 bg-white text-sm -ml-8"
                              disabled={empbirthday.disableButtonState || empbirthday.wished }
                            >
                              {empbirthday.wished || empbirthday.disableButtonState  ? "Wished" : "Wish"}
                            </button>
                          </div>
                        )}
                    </div>
                  ) : (
                    ""
                  )}
                {parseInt(empbirthday.dateOfBirth.split("-").slice(0, 2)) === current_day + 1 &&
                  parseInt(empbirthday.dateOfBirth.split("-").slice(1, 2)) === current_month ? (
                    <h1 className="col-span-2 text-[14.5px] text-red-600 ">Tomorrow</h1>
                  ) : (
                    <>
                      {parseInt(empbirthday.dateOfBirth.split("-")[0]) !== current_day && (
                        <>
                          {empbirthday.dateOfBirth.split("-").slice(0, 2).join("-") + "-" + current_year}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayMail;
