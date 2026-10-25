import Avatar1 from 'design/images/avatar1.png';
import Avatar2 from 'design/images/avatar2.jpeg';

import '../SectionContainer.scss';
import './Information.scss';

const introduction = `      數學系背景出身來說對比資工科系的長處，自覺在「邏輯設計」或需要「數學運算」方面來的好，也為了幫助更多非本科系的成人或甚至國高中生，盡量用易懂且圖像型的方式教學理解演算法。

      以自己過去的工作經驗來看，自從 ChatGPT 廣為應用後，前端工程既不用靠自己記憶撰寫、也不會在面對複雜邏輯時找不到答案，比起早期在 Stack OverFlow 上搜尋解決辦法來說更為方便。工程師面試時常考白板題，主要也是衡量對方的技術知識外，就是看邏輯能力或臨場自主能力，但在凡事皆能 Google 找答案的現今，考驗對方是否能在未做過某項功能的情況下，去閱讀官方文件或尋問 AI 完成作法，這種獨立工程與理解、試誤能力或許更為重要。

      對於日新月異的技術更迭或是不了解的東西，除了 ChatGPT 以外也有許多線上免費的影片資源可學，但最重要的初衷應該還是，我對於能將設計的畫面或想法，實際產出變成符合的畫面或遊戲(埋一些彩蛋)等等，屬於成就感的部分才是支持我繼續學習前進的動力吧！`

const Information = () => {

	return (
		<section id="Information" className="informationSection" style={{ "--clr": getComputedStyle(document.body).getPropertyValue('--cream_color')}}>
			<div className="information-info">
				<div className="information-info-detail">
					<div className="information-info-avatar">
						<img src={Avatar1} alt="Avatar1" className="avatarImg"/>
						<img src={Avatar2} alt="Avatar2" className="avatarImg" />
					</div>
					<p className="name">洪世桓</p>
					<p className="job">ADE · Any-Domain Engineer</p>
					<p style={{ fontSize: "15px", marginTop: "-6px", color: "#555", whiteSpace: "pre-wrap" }}>{`「哪都能做」工程師
這年頭 vibe coding，工程師好像都被逼成 Any-Domain ——
什麼都得做得出來 XD`}</p>
					<p>🏠  Taiwan / Taipei</p>
					<p>📬  getsulin@gmail.com</p>
					<p>📞  0921-512-668</p>
					<p>🏫  國立臺灣師範大學 數學系 畢</p>
				</div>

				<div className="information-info-intro">
					<p>【一隻從大學開始接觸程式的史萊姆】</p>
					{introduction}
				</div>
			</div>

			<div className="information-bottom">
				技能

				<div className="underline w90"></div>

				<div style={{ margin: "8px 0 24px", fontSize: "16px", fontWeight: 500, lineHeight: 1.6 }}>
					{`以下不按「熟練度」排，按「我什麼時候進到這個領域、做出了什麼」排 ——
因為在 AI 能幫你補語法的現在，廣度（敢進、進得去、做得出來）比單點深度更難假裝。`}
				</div>

				<div className="information-bottom-skill">
					<div className="information-bottom-skill-items">
						<ul className="information-bottom-skill-item-title">
							<li>前端 React / Vue</li>
						</ul>

						<div className="information-bottom-skill-item-text">
							{`本行。早期 classComponent，現以 Hook 建新專案。
2024 起獨力完成多套企業後台 / Dashboard，
含 i18n、權限、RWD，接案也從 webpack 從零設定過。`}
						</div>
					</div>

					<div className="information-bottom-skill-items">
						<ul className="information-bottom-skill-item-title">
							<li>後端 Service（2024 進入）</li>
						</ul>

						<div className="information-bottom-skill-item-text">
							{`碰之前沒寫過 service。
Node / Express + MongoDB + Docker，
處理排程通知、資料同步、信件寄送等背景服務；
早期也用過 GCP Cloud Functions + Firestore。`}
						</div>
					</div>

					<div className="information-bottom-skill-items">
						<ul className="information-bottom-skill-item-title">
							<li>Python / 爬蟲</li>
						</ul>

						<div className="information-bottom-skill-item-text">
							{`寫爬蟲定期蒐集外部公開資料，
清洗後入庫供系統使用；
搭配排程自動化更新。`}
						</div>
					</div>

					<div className="information-bottom-skill-items">
						<ul className="information-bottom-skill-item-title">
							<li>Unity XR / C#（2025 進入）</li>
						</ul>

						<div className="information-bottom-skill-item-text">
							{`碰之前沒寫過 C#。
Unity 6 + Meta Quest 3，
做到 VR 遙控機器人、沉浸式復健訓練實機可跑。`}
						</div>
					</div>

					<div className="information-bottom-skill-items">
						<ul className="information-bottom-skill-item-title">
							<li>Edge AI / 電腦視覺</li>
						</ul>

						<div className="information-bottom-skill-item-text">
							{`地端邊緣裝置逐張影像分析，
自寫精簡推論路徑讓 GPU 同跑偵測與 VLM，
串 FastAPI 雲端儀表與 WebXR 呈現。`}
						</div>
					</div>

					<div className="information-bottom-skill-items">
						<ul className="information-bottom-skill-item-title">
							<li>雲端 / 部署</li>
						</ul>

						<div className="information-bottom-skill-item-text">
							{`AWS EC2 架機跑服務、GoDaddy 管網域與 DNS、
Docker 容器化、Vercel 佈署前端 ——
負責把寫好的東西真的推上線、讓外部連得到。`}
						</div>
					</div>

					<div className="information-bottom-skill-items">
						<ul className="information-bottom-skill-item-title"><li>其他 / 基本功</li></ul>

						<ul style={{marginLeft: "24px", listStyle: "circle"}}>
							<li>HTML / CSS / SCSS、i18n、Git</li>
							<li>MongoDB / PostgreSQL</li>
							<li>WordPress</li>
							<li style={{whiteSpace: "pre-wrap"}}>{`資安弱掃處理\n(黑箱:ZAP/白箱:SonarQube)`}</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}

export default Information;