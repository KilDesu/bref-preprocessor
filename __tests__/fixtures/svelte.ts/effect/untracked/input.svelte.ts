let s$count: number = 1;
let d$double: number = s$count * 2;

e$: d$double,
	() => {
		console.log(s$count, d$double);
	};