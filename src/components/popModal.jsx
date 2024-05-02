// Example Modal component using Tailwind CSS for styling
const Modal_card = ({ onClose, onConfirm, children }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                {children}
                <div className="flex justify-end mt-4">
                    <button className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded mr-2" onClick={onClose}>Cancel</button>
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default Modal_card;