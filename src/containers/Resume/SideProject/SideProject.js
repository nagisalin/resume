import DemoBlock from './DemoBlock/DemoBlock';

import '../SectionContainer.scss';
import './SideProject.scss';

import loginPageImg from 'design/pictures/loginPage.png';
import chartPageImg from 'design/pictures/chartPage.png';
import listPageImg from 'design/pictures/listPage.png';

import aiParkImg from 'design/pictures/aiParkImg.png';
import kioskImg from 'design/pictures/kioskImg.png';
import oaImg from 'design/pictures/oaImg.png';

const SideProject = () => {

	return (
		<section id="SideProject" className="SideProjectSection" style={{ "--clr": getComputedStyle(document.body).getPropertyValue('--skyBlue_color') }}>
			<div className="ResumeDivider" />
			
			<div className="SideProject-Container">
				<div className="SideProject-Title">
					作品應用
				</div>

				<div className="SideProject-Intro">
					<div className="SideProject-Intro-Title">太平洋建設 專案製作</div>
					<div className="SideProject-Intro-Description">{`在 太平洋建設 期間協助專案開發，
以下各段將會針對內部開發專案進行說明，
由於當中專案屬公司資產，故僅有截圖畫面及文字簡單介紹。

另，外部專案可參考上方連結直接點選閱覽，故不再此展示說明。`}
					</div>
				</div>

				<DemoBlock
					img={aiParkImg}
					imgAlt='aiPark'
					title='新北市府停車場後台管理系統'
					description={`協助開發新北市政府的停車場後台管理系統介面，
功能上包括串接車辨即時影像，由後端提供 nvr 影像並以 websocket 封包回傳給前端，
讓前端可以每秒 render 更新畫面達成監控螢幕功能。

另外也串接後端資料庫處理
停車紀錄總覽、設備清單等多種資料管理，
以及為了讓客戶能查閱每月停車狀況，
透過圓餅圖與折線圖形式呈現資料分析。`}
				/>

				<DemoBlock
					img={oaImg}
					imgAlt='oaImg'
					inverse
					title='泉源國際內部 OA 管理系統'
					description={`協助開發公司內部的管理系統，
透過 Node.js 的後端服務串 Api，讓前端可以點擊按鍵進行打卡紀錄，
並且有設計公佈欄的方式提供同仁線上查閱最新消息，
也有相關常用的內部公司文件範本可以線上下載，
方便大家平常申請外出工單下載或新進同仁的管理規範查詢。`}
				/>

				<DemoBlock
					img={kioskImg}
					imgAlt='kioskImg'
					title='停車場事業 KIOSK 繳費機系統介面'
					description={`協助開發公司的停車場 KIOSK 繳費機介面，
由於當時沒有 Design 協助，
因此我當時是自行到外面參考現有產品介面，
並統整歸納各家功能與概念後重新編排，
在設計上特別修改的點是
底下 Footer 有做 電話圖示 與 語言切換，
這是大多數現有停車繳費機沒有的設計。`}
				/>

				<div className="SideProject-Intro">
					<div className="SideProject-Intro-Title">CodingBar 線上教學平台系統</div>
					<div className="SideProject-Intro-Description">{`在 瑞比智慧科技公司 期間協助維護與開發新功能，
以下各段將會針對重點功能說明，相關示範請由上方導覽頁點選觀看，
Other 也有更多額外功能開發時的截圖 與 特別經歷紀錄。`}
					</div>
				</div>

				<DemoBlock
					img={loginPageImg}
					imgAlt='loginPage'
					title='Login Page'
					description={`平台有登入頁面讓學生透過帳號密碼登入，
除了基本切版之外，設計端上有需求要使用到
Carousel 套件處理右側輪播圖，因此當時由我研究官方 Doc 引入 Package 使用。
此頁面由於有手機登入需求，因此含簡易 RWD 設計。
					
另外此範例有串 Firebase 作為後端使用者帳戶處理，
可點選註冊或忘記密碼進行基本帳戶功能使用，
亦或利用 trial account 驗證登入
(成功登入我這邊是做跳出一個 alert 示範😂)`}
				/>

				<DemoBlock
					img={chartPageImg}
					inverse
					imgAlt='chartPage'
					title='Chart Page'
					description={`平台設計使用圖表方式呈現一些數據面的資訊，
依照設計端協助處理重複 Component 與切版，
上方也有 Tab 標籤頁設計。
					
這邊在下方的全部商品評分處，為了計算與全部人的離群程度，使用到數學的標準差計算，當初其他的同仁一看到設計 spec 時就直接說：「這數學看起來好難哦早就忘光了，交給史萊姆數學系的好了XD」，於是這邊的 task 就由我全部處理了😅
					
const getStandardDeviation = (data, average) => {
  if (!data) return
	
  const totalPower = data.reduce((total, el) =>
        { return total + el ** 2 }, 0)
	
  return Math.sqrt((totalPower / data.length) - average ** 2)
}

大概像這樣的計算QQ`}
				/>

				<DemoBlock
					img={listPageImg}
					imgAlt='listPage'
					title='List Page'
					description={`平台很常有列表需要做資料管理，
因此 Rectangle 與後面 Hamburger 的組合 component 還滿常使用的。

這邊有串 FireStore 的後端實作資料庫，
並且實作基礎 CRUD，也有簡易搜尋功能。`}
				/>
			</div>
		</section>
	);
}

export default SideProject;