import cls from 'classnames';

interface Props {
	rounded?: boolean;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	color?: 'red' | 'blue' | 'green';
}

export const Button: React.FC<Props> = (props) => {
	const { rounded = true, children, onClick, color } = props;
	const className = cls('border ml-0.5 py-0.5 px-1', {
		rounded,

		'bg-red-50': color === 'red',
		'border-red-200': color === 'red',
		'bg-blue-50': color === 'blue',
		'border-blue-200': color === 'blue',
		'bg-green-50': color === 'green',
		'border-green-200': color === 'green',
	});
	return (
		<button onClick={onClick} className={className}>
			{children}
		</button>
	);
};
