
## Technologies Used

- React.js
- Vite
- JavaScript
- CSS
- Axios
- React Router

## Environment Setup

Create a `.env` file in the frontend root directory.


VITE_BACKEND_URL=http://localhost:5000/api

## Testing

Automated frontend tests are not currently documented. A test framework and test scripts should be configured before running automated tests.

## Notes

- Axios is used to communicate with the backend APIs.
- API services are organized inside `src/api`.
- Main application pages are organized inside `src/pages`.
- Shared dashboard components are maintained inside `src/components`.
- With more time, I would add automated tests, improve accessibility, and enhance the overall user experience.



### Assumptions
- Glucose readings are recorded in mg/dL.
- Users provide their blood glucose readings manually.
- Each reading belongs to an authenticated user.
- Sample readings are dummy data created for demonstration purposes.
- The application is designed to support diabetes tracking and awareness, not replace professional medical advice.

### Future Improvements
- Integrate AI-based food image analysis and nutritional estimation.
- Add Indian food recommendations based on meal information.
- Improve glucose trend analysis and personalized insights.
- Add reminders for glucose testing and medication schedules.
- Implement stronger input validation and automated testing.
- Improve security, performance, and error handling.
