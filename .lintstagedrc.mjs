const config = {
	"*.{js,jsx,ts,tsx}": ["oxlint --fix", "oxfmt"],
	"*.{json,css,md,yaml,yml}": ["oxfmt"],
};

export default config;
