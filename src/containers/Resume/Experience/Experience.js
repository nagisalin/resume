import '../SectionContainer.scss';
import './Experience.scss';

const Experience = () => {
	const experiences = [
		{
			duration: '三月 2024 - 至今',
			title: 'ADE · Any-Domain Engineer',
			company: 'LSC / Sonice (在職中)',
			position: '一個人把不熟的領域一個個做到上線',
			description: `數學系出身，到這份工作為止，沒有一個技術領域是我科班的。
Unity 碰之前沒寫過 C#、後端碰之前沒寫過 service、Edge AI 碰之前沒碰過電腦視覺。
這 32 個月，它們都上線了 —— 其中 <b>35 個專案是我一個人從第一行 code 寫到部署</b>（本人 commit 數 ＝ 專案總 commit 數，不是「參與」）。

跟上面三段相反，這段我不條列「做了哪些功能」——
在 AI 幫你寫扣的時代，功能清單誰都列得出來，等於沒寫。
我想講的是「我原本不會，後來怎麼讓它上線」（以下皆為去識別化的概念描述）：

<b>・企業前端 / Dashboard</b>
　為企業客戶獨力完成多套內部管理後台與營運儀表板 (React / Vue)，
　含權限、i18n、報表與 RWD。

<b>・後端 Service</b>（碰之前沒寫過 service）
　Node / Express + MongoDB + Docker，撐起任務排程通知、
　跨系統資料同步、信件寄送等背景服務。

<b>・Python 爬蟲 / 自動化</b>
　寫爬蟲定期蒐集外部公開資料，清洗後入庫供系統使用。

<b>・Unity XR / Meta Quest 3</b>（碰之前沒寫過 C#）
　VR 遙控機器人（頭盔看即時影像、手勢下指令）、沉浸式復健訓練，實機可跑。

<b>・地端 Edge AI</b>
　在地端邊緣裝置上即時分析數百路影像串流，自寫精簡推論路徑讓 GPU
　同時跑物件偵測與 VLM 摘要，雲端儀表 + AI 語音答詢 + WebXR 呈現一條龍
　（資料全程地端去識別化，不回傳原始影像、不辨識任何人）。

<b>・雲端 / 部署</b>
　AWS EC2 架機跑服務、GoDaddy 管網域與 DNS、Docker 容器化、Vercel 佈署前端——
　寫完不是結束，把它推上線、讓外部連得到才算數。

此外也獨力落地 電動車充電 領域的整套系統（使用者 App、營運後台、金流訂閱、充電樁通訊、資料爬蟲）。

重點不是「我會很多技術」，而是 <b>「沒有一樣是我原本的本行，但它們都真的上線了」</b>。
這大概就是前面數學系那段說的 —— 比起記得語法，更吃的是看文件、問 AI、試錯，
然後硬是把它做出來的那股勁吧 :)`,
		},
		{
			duration: '九月 2023 - 二月 2024',
			title: 'Front-End Engineer',
			company: '太平洋建設(蝦米智慧) (已離職)',
			position: '專案前端開發 / 資安弱點掃描',
			description: `專案型處理前端工作事項，
根據設計製作並一人完成從開版到 RWD 樣式、Webpack 設定等，
乃至 Deploy 於 IIS 令專案上線。
			
專案分別為：
[外部專案類]
- 製作<a href="https://www.sabahyan.com/" target="_blank" rel="noreferrer noopener">沙巴官燕官方網站</a>
- 製作<a href="http://www.pacific-aiot.com.tw/" target="_blank" rel="noreferrer noopener">泉源國際官方網站</a>
- 製作<a href="https://transport-curation.nat.gov.tw/museum/index.html" target="_blank" rel="noreferrer noopener">松山機場小學堂活動網站</a>

[內部專案類]
- 新北市府停車場後台管理系統 (含獨立設計)
- 新竹警局 ISMS 管理系統 (含獨立設計)
- 泉源國際內部 OA 管理系統 (含獨立設計)
   此專案有額外 Node.js 建立全端設計
   供公司同仁進行 上下班打卡 及 公告資訊用 系統
- 停車場事業 KIOSK 繳費機系統介面 (含獨立設計)

除一般專案外，亦負責專案的資安弱掃處理項目，
針對專案定期進行黑白箱弱掃，
並協助修復掃描問題。`,
		},
		{
			duration: '七月 2021 - 六月 2023',
			title: 'Front-End Engineer',
			company: '瑞比智慧科技(CodingBar) (已離職)',
			position: '平台前端 Feature 開發 / Issue 維護',
			description:
				'- 協助製作程式教學平台，前端維護與需求開發\n- 負責與後端溝通合作串接 API 功能，定期 Weekly Meeting\n- 擔任前端負責人( 1~3 人成員) 分配工作項目 與 專案 PM\n\n- 協助 git 進退版處理，QA 把關 deploy 至 staging/prod\n- 建立 Notion 筆記制度，方便日後培訓公司新人或交接\n\n- 使用 GCP 與 Cloud Functions 承接外包自動化爬蟲專案\n- 使用 Wordpress 生成 CSFC 檢定 官網',
		},
		{
			duration: '四月 2018 - 七月 2021',
			title: 'Course Design/Teaching',
			company: '瑞比智慧科技(CodingBar) (已離職)',
			position: '課程設計開發 / 教學講師\n(教學 Python, C++ / 國高中程式教育)',
			description:
				'- 協助設計最初版 Python 程式教育課程，規劃投影片製作與課堂 習題設計，\n   以及後來的線上課程錄製與資優班學生特規教材\n- 整理課程開發所需資源，並建檔規格化處理\n- 擔任課程組負責人(3~5人成員) 分配工作項目 與 合作開發\n- 規劃 MTA(現稱 ITS) 考試題庫以提高證照合格通過率。',
		},
	];

	return (
		<section
			id="Experience"
			className="ExperienceSection"
			style={{ '--clr': getComputedStyle(document.body).getPropertyValue('--lightYellow_color') }}>
			<div className="ResumeDivider" />

			<div className="timeline-container">
				<div className="timeline-axis" />
				<div className="timeline">
					{experiences.map((experience, index) => (
						<div key={index} className="timeline-item">
							<div className="circle" />
							<div className="job-intro">
								<div className="duration">{experience.duration}</div>
								<div className="title">{experience.title}</div>
								<div className="company">{experience.company}</div>
								<div className="position">{experience.position}</div>
							</div>

							<div className="job-list" dangerouslySetInnerHTML={{ __html: experience.description }}>
								{/* {experience.description} */}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Experience;
