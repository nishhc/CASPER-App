type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function FieldPair(props: {
  label: string;
  required?: boolean;
  leftProps?: InputProps;
  rightProps?: InputProps;
}) {
  const { label, required, leftProps, rightProps } = props;
  return (
    <div className="field-pair">
      <label className="field-label">
        {required && <span className="req">*</span>} {label}
      </label>
      <div className="pair">
        <input className="pill-input" {...leftProps} />
        <span className="to">to</span>
        <input className="pill-input" {...rightProps} />
      </div>
    </div>
  );
}

export default FieldPair;