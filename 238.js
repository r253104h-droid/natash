const cards = [...document.querySelectorAll('.job-card')];
const keyword = document.querySelector('#keyword');
const workType = document.querySelector('#workType');
const studyArea = document.querySelector('#studyArea');
const count = document.querySelector('#resultCount');
const emptyState = document.querySelector('#emptyState');
const chips = [...document.querySelectorAll('.filter-chip[data-category]')];
const activityFilters = [...document.querySelectorAll('.activity-filter')];
const activityCards = [...document.querySelectorAll('.activity-card')];
const activityCount = document.querySelector('#activityCount');
const activityEmpty = document.querySelector('#activityEmpty');
const studyAnimation = document.querySelector('#studyAnimation');
const studyAnimationLabel = document.querySelector('#studyAnimationLabel');
let activeCategory = 'all';
let toastTimer;
let pathwaySketch;

function filterJobs() {
	if (!keyword || !workType || !studyArea || !count || !emptyState) return;

	const query = keyword.value.trim().toLowerCase();
	const type = workType.value;
	const study = studyArea.value;
	let visible = 0;
	cards.forEach((card) => {
		const matchesQuery = !query || card.dataset.title.includes(query);
		const matchesType = !type || card.dataset.type === type;
		const matchesCategory = activeCategory === 'all' || card.dataset.category.split(' ').includes(activeCategory);
		const matchesStudy = !study || card.dataset.study.split(' ').includes(study);
		const show = matchesQuery && matchesType && matchesCategory && matchesStudy;
		card.hidden = !show;
		if (show) visible += 1;
	});
	count.textContent = `${visible} ${visible === 1 ? 'opportunity' : 'opportunities'}`;
	emptyState.style.display = visible ? 'none' : 'block';
}

function filterActivities(type) {
	let visible = 0;
	activityCards.forEach((card) => {
		const show = type === 'all' || card.dataset.activityType === type;
		card.hidden = !show;
		if (show) visible += 1;
	});
	if (activityCount) activityCount.textContent = `${visible} ${visible === 1 ? 'activity' : 'activities'}`;
	if (activityEmpty) activityEmpty.style.display = visible ? 'none' : 'block';
}

function showStudyAnimation(area) {
	if (!studyAnimation || !studyAnimationLabel || !area) {
		if (studyAnimation) studyAnimation.hidden = true;
		return;
	}
	studyAnimation.hidden = false;
	studyAnimationLabel.textContent = `${studyArea.selectedOptions[0].textContent} → related career options`;
	pathwaySketch?.selectArea(area);
}

function showToast(message) {
	const toast = document.querySelector('#toast');
	toast.textContent = message;
	toast.classList.add('visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

const searchForm = document.querySelector('#searchForm');
if (searchForm) {
	searchForm.addEventListener('submit', (event) => {
		event.preventDefault();
		filterJobs();
		document.querySelector('#opportunities').scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
}

const supportToggle = document.querySelector('#supportToggle');
const supportDetails = document.querySelector('#careerSupportDetails');
if (supportToggle && supportDetails) {
	supportToggle.addEventListener('click', () => {
		const isExpanded = supportToggle.getAttribute('aria-expanded') === 'true';
		supportToggle.setAttribute('aria-expanded', String(!isExpanded));
		supportDetails.hidden = isExpanded;
		const indicator = supportToggle.querySelector('.toggle-indicator');
		if (indicator) indicator.textContent = isExpanded ? '+' : '−';
	});
}

keyword?.addEventListener('input', filterJobs);
workType?.addEventListener('change', filterJobs);
studyArea?.addEventListener('change', () => {
	filterJobs();
	showStudyAnimation(studyArea.value);
});
chips.forEach((chip) => chip.addEventListener('click', () => {
	activeCategory = chip.dataset.category;
	chips.forEach((item) => item.setAttribute('aria-pressed', String(item === chip)));
	filterJobs();
}));
activityFilters.forEach((button) => button.addEventListener('click', () => {
	const type = button.dataset.activityFilter;
	activityFilters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
	filterActivities(type);
}));
document.querySelectorAll('.save-button').forEach((button) => button.addEventListener('click', () => {
	const saved = button.getAttribute('aria-pressed') !== 'true';
	button.setAttribute('aria-pressed', String(saved));
	button.textContent = saved ? '♥' : '♡';
	showToast(saved ? 'Opportunity saved to your list.' : 'Opportunity removed from your list.');
}));
document.querySelectorAll('[data-study-target]').forEach((button) => button.addEventListener('click', () => {
	if (!studyArea) return;
	studyArea.value = button.dataset.studyTarget;
	filterJobs();
	showStudyAnimation(studyArea.value);
	document.querySelector('#jobsHeading').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));
document.querySelectorAll('.rsvp').forEach((button) => button.addEventListener('click', () => {
	const added = button.getAttribute('aria-pressed') !== 'true';
	button.setAttribute('aria-pressed', String(added));
	button.textContent = added ? '✓ Added to my calendar' : '＋ Add to my calendar';
	showToast(added ? 'Event added to your list.' : 'Event removed from your list.');
}));
filterJobs();
filterActivities('all');

if (window.p5 && studyAnimation && studyAnimationLabel) {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const routeColors = {
		computing: '#315f96',
		business: '#b08231',
		environment: '#4e7a62',
		communication: '#ad5742',
		engineering: '#2863a0'
	};
	pathwaySketch = new p5((p) => {
		let activeArea = '';
		let progress = 0;
		let accent = routeColors.computing;
		let canvas;

		p.setup = () => {
			const container = document.querySelector('#studyCanvas');
			canvas = p.createCanvas(container.clientWidth, 88);
			canvas.parent(container);
			p.pixelDensity(1);
			p.noLoop();
		};

		p.draw = () => {
			p.clear();
			if (!activeArea) return;

			const points = [p.createVector(p.width * 0.12, 30), p.createVector(p.width * 0.5, 48), p.createVector(p.width * 0.88, 30)];
			p.stroke('#cbd8e8');
			p.strokeWeight(2);
			p.line(points[0].x, points[0].y, points[1].x, points[1].y);
			p.line(points[1].x, points[1].y, points[2].x, points[2].y);

			const routeProgress = progress * 2;
			p.stroke(accent);
			p.strokeWeight(3);
			if (routeProgress <= 1) {
				p.line(points[0].x, points[0].y, p.lerp(points[0].x, points[1].x, routeProgress), p.lerp(points[0].y, points[1].y, routeProgress));
			} else {
				p.line(points[0].x, points[0].y, points[1].x, points[1].y);
				const segmentProgress = routeProgress - 1;
				p.line(points[1].x, points[1].y, p.lerp(points[1].x, points[2].x, segmentProgress), p.lerp(points[1].y, points[2].y, segmentProgress));
			}

			points.forEach((point, index) => {
				p.fill(index === 2 && progress >= 1 ? accent : '#ffffff');
				p.stroke(accent);
				p.strokeWeight(2);
				p.circle(point.x, point.y, 12);
			});

			const segment = Math.min(1, Math.floor(routeProgress));
			const segmentProgress = routeProgress >= 2 ? 1 : routeProgress - segment;
			const pulse = p5.Vector.lerp(points[segment], points[Math.min(segment + 1, 2)], segmentProgress);
			p.noStroke();
			p.fill(accent);
			p.circle(pulse.x, pulse.y, 8);
			p.fill('#52647a');
			p.textSize(10);
			p.textAlign(p.CENTER, p.TOP);
			p.text('STUDY', points[0].x, 56);
			p.text('SKILLS', points[1].x, 56);
			p.text('CAREER', points[2].x, 56);

			if (progress < 1) {
				progress = Math.min(1, progress + 0.025);
			} else {
				p.noLoop();
			}
		};

		p.windowResized = () => {
			if (!canvas) return;
			p.resizeCanvas(document.querySelector('#studyCanvas').clientWidth, 88);
			if (activeArea) p.redraw();
		};

		p.selectArea = (area) => {
			activeArea = area;
			accent = routeColors[area] || routeColors.computing;
			progress = reducedMotion ? 1 : 0;
			const width = document.querySelector('#studyCanvas').clientWidth;
			if (width > 0 && p.width !== width) p.resizeCanvas(width, 88);
			if (reducedMotion) p.redraw();
			else p.loop();
		};
	}, document.querySelector('#studyCanvas'));
}
