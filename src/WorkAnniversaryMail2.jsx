// This Is Work Anniversary Project

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { IoMdCheckmarkCircleOutline } from 'react-icons/io';


const WorkAnniversaryMail2 = () => {
  const [anniversaryData, setAnniversaryData] = useState([]);
  const [flag, setFlag] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [disableButtonState, setDisableButtonState] = useState(""); // Local state for button disable
  const [empInfo,setEmpInfo]=useState("");
  const [employee, setEmployee] = useState("");
  const [successMessage, setSuccessMessage] = useState('');

  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    axios.get('http://localhost:8080/api/work-anniversary/getall')
      .then((response) => {
        const formattedData = response.data.map((item) => ({
          ...item,
          dateOfJoining: format(new Date(item.dateOfJoining), 'dd-MM-yyyy'),
          disableButtonState: localStorage.getItem(`disableButtonState_${item.empId}`) === 'true',
          
        }));

        setAnniversaryData(formattedData);
        
      })
      .catch((error) => {
        console.error('Error fetching work anniversary data:', error);
      });
      
  }, []);


  useEffect(() =>{
    localStorage.setItem("WAData",JSON.stringify(anniversaryData))
  },[anniversaryData])


  const celebratingToday = anniversaryData.filter((workAnniversary) => {
    const [anniversaryDay, anniversaryMonth] = workAnniversary.dateOfJoining.split('-').map(Number);
    return currentDay === anniversaryDay && currentMonth === anniversaryMonth;
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
        axios.get(`http://localhost:8080/api/work-anniversary/send_wish?empId=${selectedEmployeeId.empId}&message=${messageContent}`)
            .then((response) => {
                const { result,empId } = response.data;
                setDisableButtonState(result); // Add a new property to track disabled state
                setEmpInfo(empId);
                console.log('Result from server:', result);
                if (response.data) {
                  console.log("Email sent successfully");
      
                  //update the state to mark emp as wished
                  setAnniversaryData((prevData) => prevData.map((item) =>
                    item.id === selectedEmployeeId.id ? { ...item, wished: true, disableButtonState: true } : item
      
                  ));
                  
                  // Update the success message state with the checkmark icon
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
      <div className=''>
        <div className='bg-gray-200 h-screen w-full'>
          <div className='bg-white h-[230px] w-[500px] rounded-lg ml-8 mt-4 absolute overflow-y-auto'>
            <div className='ml-3 mt-4'>
              <h1 className='text-lg font-semibold'>
                Celebrating Work Anniversary Today
              </h1>
              {successMessage && (
                <div className='mt-4 -mb-2 text-center text-green-600'>
                  {successMessage}
                </div>
              )}
              {celebratingToday.map((workAnniversary) => (
                <div key={workAnniversary.id} className='grid grid-cols-7 mt-3'>
                  <div className='w-92 flex mt-7 col-span-4'>
                    <img
                      src={`data:image/octet-stream;base64,${workAnniversary.imgName}`}
                      style={{ width: '58px', height: '45px' }}
                      className='rounded-full -mt-2'
                    />
                    <div className='ml-4 mr-6 -mt-1 text-gray-500'>
                      <h2 className='text-[14px] font-bold mr-2 '>
                        {workAnniversary.empName}-{workAnniversary.empId}
                      </h2>
                      <p className='text-[14px]'>
                        {workAnniversary.empDesignation}
                      </p>
                    </div>
                  </div>
                  <div className='col-span-2 mt-[27px] text-[13px] text-green-600 -ml-3'>
                    {currentYear - workAnniversary.dateOfJoining.split('-')[2]} Year Completed
                  </div>
                  <div className='col-span-1 mt-6 text-sm'>
                    {flag &&
                      selectedEmployeeId &&
                      selectedEmployeeId.id === workAnniversary.id ? (
                        <div className="mt-10 bg-white pt-6 -ml-[345px] flex gap-1 text-xs ">
                          <input
                            type="text"
                            placeholder="............"
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
                        <div>
                          <button
                            onClick={() => toggleFlag(workAnniversary)}
                            className="border border-blue-500 h-7 w-[72px] text-blue-500 bg-white text-sm -ml-8"
                            disabled={workAnniversary.disableButtonState || workAnniversary.wished}
                          >
                            {workAnniversary.wished || workAnniversary.disableButtonState ? "Wished" : "Wish"}
                          </button>
                        </div>
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

export default WorkAnniversaryMail2;

