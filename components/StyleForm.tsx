import React, { useState } from 'react';

interface StyleFormProps {
  onSubmit: (formData: {
    styleDescription: string;
    skinColor: string;
    gender: string;
    expression: string;
  }) => void;
  isLoading: boolean;
}

const StyleForm: React.FC<StyleFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    styleDescription: '',
    skinColor: '',
    gender: '',
    expression: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="styleDescription" className="form-label">
          Style Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="styleDescription"
          name="styleDescription"
          rows={4}
          className="input"
          placeholder="Describe your preferred fashion style (e.g., casual streetwear with vintage elements)"
          value={formData.styleDescription}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="skinColor" className="form-label">
          Skin Color
        </label>
        <input
          type="text"
          id="skinColor"
          name="skinColor"
          className="input"
          placeholder="E.g., fair, medium, olive, dark"
          value={formData.skinColor}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="gender" className="form-label">
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          className="input"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="">Select gender (optional)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="expression" className="form-label">
          Expression/Mood
        </label>
        <input
          type="text"
          id="expression"
          name="expression"
          className="input"
          placeholder="E.g., professional, casual, elegant, edgy"
          value={formData.expression}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full mt-4"
        disabled={isLoading || !formData.styleDescription.trim()}
      >
        {isLoading ? 'Finding Recommendations...' : 'Get Fashion Recommendations'}
      </button>
    </form>
  );
};

export default StyleForm;
